import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { isGoogleAuthConfigured, getBaseUrl, getGoogleOAuthUrl } from "../google-auth";

describe("google-auth utility", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("isGoogleAuthConfigured returns false when env variables are empty or missing", () => {
    process.env.GOOGLE_CLIENT_ID = "";
    process.env.GOOGLE_CLIENT_SECRET = "";
    expect(isGoogleAuthConfigured()).toBe(false);

    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
    expect(isGoogleAuthConfigured()).toBe(false);
  });

  it("isGoogleAuthConfigured returns true when both credentials are provided", () => {
    process.env.GOOGLE_CLIENT_ID = "mock-client-id.apps.googleusercontent.com";
    process.env.GOOGLE_CLIENT_SECRET = "mock-client-secret";
    expect(isGoogleAuthConfigured()).toBe(true);
  });

  it("getBaseUrl uses NEXT_PUBLIC_APP_URL if defined", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://peserta39.m1sec.my.id/";
    expect(getBaseUrl()).toBe("https://peserta39.m1sec.my.id");
  });

  it("getBaseUrl defaults to localhost if nothing is set", () => {
    delete process.env.NEXT_PUBLIC_APP_URL;
    expect(getBaseUrl()).toBe("http://localhost:3000");
  });

  it("getGoogleOAuthUrl formats correct Google Auth URL", () => {
    process.env.GOOGLE_CLIENT_ID = "test-client-id";
    const urlStr = getGoogleOAuthUrl("https://peserta39.m1sec.my.id", "state123");
    const parsed = new URL(urlStr);

    expect(parsed.origin).toBe("https://accounts.google.com");
    expect(parsed.pathname).toBe("/o/oauth2/v2/auth");
    expect(parsed.searchParams.get("client_id")).toBe("test-client-id");
    expect(parsed.searchParams.get("redirect_uri")).toBe("https://peserta39.m1sec.my.id/api/auth/callback/google");
    expect(parsed.searchParams.get("response_type")).toBe("code");
    expect(parsed.searchParams.get("state")).toBe("state123");
    expect(parsed.searchParams.get("scope")).toContain("openid");
  });
});

