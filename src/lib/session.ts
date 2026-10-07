import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { db } from "./db";

// Two independent sessions: adults (parent/teacher dashboard) and children (mission area).
// Signed, httpOnly, sameSite=lax cookies; role-based access is enforced in each server entry point.

const ADULT_COOKIE = "ck_adult";
const CHILD_COOKIE = "ck_child";
const ADULT_TTL = 60 * 60 * 24 * 7; // 7 days
const CHILD_TTL = 60 * 60 * 24 * 30; // 30 days

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("AUTH_SECRET harus diisi (minimal 32 karakter).");
  return new TextEncoder().encode(s);
}

async function sign(payload: Record<string, unknown>, ttl: number) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ttl}s`)
    .sign(secret());
}

async function verify<T>(token: string | undefined): Promise<T | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as T;
  } catch {
    return null;
  }
}

const cookieOpts = (maxAge: number) => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge,
});

/* ------------------------------ Adult ------------------------------ */

export type Role = "PARENT" | "TEACHER";

export async function createAdultSession(userId: string, role: Role) {
  const jar = await cookies();
  jar.set(ADULT_COOKIE, await sign({ sub: userId, role }, ADULT_TTL), cookieOpts(ADULT_TTL));
}

export async function getAdultSession() {
  const jar = await cookies();
  const p = await verify<{ sub: string; role: Role }>(jar.get(ADULT_COOKIE)?.value);
  return p ? { userId: p.sub, role: p.role } : null;
}

export async function requireAdult() {
  const s = await getAdultSession();
  if (!s) redirect("/akun/masuk");
  const user = await db.user.findUnique({ where: { id: s.userId } });
  if (!user) redirect("/akun/masuk");
  return user;
}

export async function clearAdultSession() {
  (await cookies()).delete(ADULT_COOKIE);
}

/* ------------------------------ Child ------------------------------ */

export async function createChildSession(childId: string) {
  const jar = await cookies();
  jar.set(CHILD_COOKIE, await sign({ sub: childId, role: "CHILD" }, CHILD_TTL), cookieOpts(CHILD_TTL));
}

export async function getChildSession() {
  const jar = await cookies();
  const p = await verify<{ sub: string; role: string }>(jar.get(CHILD_COOKIE)?.value);
  return p && p.role === "CHILD" ? { childId: p.sub } : null;
}

export async function requireChild() {
  const s = await getChildSession();
  if (!s) redirect("/masuk");
  const child = await db.childProfile.findUnique({ where: { id: s.childId } });
  if (!child) redirect("/masuk");
  return child;
}

export async function clearChildSession() {
  (await cookies()).delete(CHILD_COOKIE);
}

/** Can this adult view/manage this child? (RBAC, NFR-SC-03) */
export async function adultCanAccessChild(userId: string, childId: string) {
  const child = await db.childProfile.findUnique({
    where: { id: childId },
    include: { class: { select: { teacherId: true } } },
  });
  if (!child) return null;
  if (child.parentId === userId || child.class?.teacherId === userId) return child;
  return null;
}

