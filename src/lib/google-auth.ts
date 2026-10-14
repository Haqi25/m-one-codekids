export function getBaseUrl(request?: Request): string {
  // If explicitly configured in environment
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  // Otherwise check request headers (e.g. reverse proxy / Dokploy)
  if (request) {
    const proto = request.headers.get("x-forwarded-proto") || "http";
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
    if (host) {
      return `${proto}://${host}`;
    }
  }

  return "http://localhost:3000";
}

export function isGoogleAuthConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CLIENT_ID.trim().length > 0 &&
    process.env.GOOGLE_CLIENT_SECRET.trim().length > 0
  );
}

export function getGoogleOAuthUrl(baseUrl: string, state: string): string {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    redirect_uri: `${baseUrl}/api/auth/callback/google`,
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    access_type: "offline",
    response_type: "code",
    prompt: "select_account",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
      "openid",
    ].join(" "),
    state,
  };

  const qs = new URLSearchParams(options);
  return `${rootUrl}?${qs.toString()}`;
}

export interface GoogleUserInfo {
  id: string; // sub
  email: string;
  verified_email?: boolean;
  name: string;
  picture?: string;
}

export async function getGoogleUser(code: string, baseUrl: string): Promise<GoogleUserInfo> {
  const tokenUrl = "https://oauth2.googleapis.com/token";
  const params = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
    redirect_uri: `${baseUrl}/api/auth/callback/google`,
    grant_type: "authorization_code",
  });

  const tokenRes = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    throw new Error(`Gagal menukarkan kode Google: ${tokenRes.status} ${errText}`);
  }

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;

  const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!userRes.ok) {
    throw new Error("Gagal mengambil profil akun Google.");
  }

  const data = await userRes.json();
  return {
    id: data.sub,
    email: data.email,
    verified_email: data.email_verified,
    name: data.name || data.given_name || "Pengguna Google",
    picture: data.picture,
  };
}

