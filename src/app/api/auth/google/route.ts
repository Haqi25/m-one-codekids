import { NextRequest, NextResponse } from "next/server";
import { getBaseUrl, getGoogleOAuthUrl, isGoogleAuthConfigured } from "@/lib/google-auth";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const role = searchParams.get("role") === "TEACHER" ? "TEACHER" : "PARENT";
  const baseUrl = getBaseUrl(request);

  // If real Google OAuth credentials are not set, or user requested demo, redirect to Demo Google Flow
  if (!isGoogleAuthConfigured() || searchParams.get("demo") === "true") {
    return NextResponse.redirect(`${baseUrl}/api/auth/google/demo?role=${role}`);
  }

  const stateObj = {
    role,
    time: Date.now(),
  };
  const state = Buffer.from(JSON.stringify(stateObj)).toString("base64url");
  const authUrl = getGoogleOAuthUrl(baseUrl, state);

  return NextResponse.redirect(authUrl);
}

