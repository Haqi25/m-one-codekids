import { NextRequest, NextResponse } from "next/server";
import { getBaseUrl, getGoogleUser } from "@/lib/google-auth";
import { db } from "@/lib/db";
import { createAdultSession } from "@/lib/session";
import { randomCode } from "@/lib/codes";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const stateRaw = searchParams.get("state");
  const baseUrl = getBaseUrl(request);

  if (error || !code) {
    return NextResponse.redirect(`${baseUrl}/akun/masuk?error=Login dengan Google dibatalkan atau terjadi kesalahan.`);
  }

  let role: "PARENT" | "TEACHER" = "PARENT";
  if (stateRaw) {
    try {
      const decoded = JSON.parse(Buffer.from(stateRaw, "base64url").toString());
      if (decoded.role === "TEACHER") {
        role = "TEACHER";
      }
    } catch {
      // ignore state parsing issues
    }
  }

  try {
    const googleUser = await getGoogleUser(code, baseUrl);
    if (!googleUser.email) {
      return NextResponse.redirect(`${baseUrl}/akun/masuk?error=Akun Google tidak menyediakan email.`);
    }

    const email = googleUser.email.trim().toLowerCase();

    // 1. Search for existing user with this googleId
    let user = await db.user.findUnique({
      where: { googleId: googleUser.id },
    });

    // 2. Or search by email and link Google account
    if (!user) {
      user = await db.user.findUnique({
        where: { email },
      });

      if (user) {
        user = await db.user.update({
          where: { id: user.id },
          data: {
            googleId: googleUser.id,
            emailVerified: user.emailVerified ?? new Date(),
            image: user.image ?? googleUser.picture,
          },
        });
      }
    }

    // 3. If new user, create account
    if (!user) {
      let familyCode: string | null = null;
      if (role === "PARENT") {
        let unique = false;
        while (!unique) {
          familyCode = randomCode(6);
          const exists = await db.user.findUnique({ where: { familyCode } });
          if (!exists) unique = true;
        }
      }

      user = await db.user.create({
        data: {
          email,
          name: googleUser.name,
          role,
          googleId: googleUser.id,
          image: googleUser.picture,
          emailVerified: new Date(),
          familyCode,
        },
      });
    }

    // 4. Create adult session
    await createAdultSession(user.id, user.role as "PARENT" | "TEACHER");

    return NextResponse.redirect(`${baseUrl}/dashboard`);
  } catch (err: any) {
    console.error("Google OAuth Callback Error:", err);
    const msg = encodeURIComponent("Gagal masuk dengan Google: " + (err.message || "Silakan coba lagi"));
    return NextResponse.redirect(`${baseUrl}/akun/masuk?error=${msg}`);
  }
}

