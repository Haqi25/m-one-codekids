import { NextRequest, NextResponse } from "next/server";
import { getBaseUrl } from "@/lib/google-auth";
import { db } from "@/lib/db";
import { createAdultSession } from "@/lib/session";
import { randomCode } from "@/lib/codes";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const role = searchParams.get("role") === "TEACHER" ? "TEACHER" : "PARENT";
  const baseUrl = getBaseUrl(request);

  const isTeacher = role === "TEACHER";
  const email = isTeacher ? "demo.guru@codekids.id" : "budi.google@gmail.com";
  const name = isTeacher ? "Bu Siti Rahma (Google Demo)" : "Budi Santoso (Google Demo)";
  const googleId = isTeacher ? "demo-google-teacher-001" : "demo-google-parent-001";
  const image = isTeacher
    ? "https://api.dicebear.com/7.x/avataaars/svg?seed=Siti"
    : "https://api.dicebear.com/7.x/avataaars/svg?seed=Budi";

  let user = await db.user.findUnique({
    where: { email },
  });

  if (!user) {
    let familyCode: string | null = null;
    if (!isTeacher) {
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
        name,
        role,
        googleId,
        image,
        emailVerified: new Date(),
        familyCode,
      },
    });

    // Create a demo child if parent
    if (!isTeacher) {
      await db.childProfile.create({
        data: {
          nickname: "Andi",
          avatar: "fox",
          grade: 2,
          pinHash: bcrypt.hashSync("1234", 8),
          parentId: user.id,
          onboarded: true,
        },
      });
    }
  } else {
    // Update existing user with googleId if needed
    if (!user.googleId || !user.emailVerified) {
      user = await db.user.update({
        where: { id: user.id },
        data: {
          googleId,
          emailVerified: user.emailVerified ?? new Date(),
          image: user.image ?? image,
        },
      });
    }
  }

  await createAdultSession(user.id, user.role as "PARENT" | "TEACHER");

  return NextResponse.redirect(`${baseUrl}/dashboard`);
}

