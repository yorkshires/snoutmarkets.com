// src/lib/auth.ts
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "sm.session";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret");
const cookieDomain = process.env.COOKIE_DOMAIN || undefined;

export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);

  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    ...(cookieDomain ? { domain: cookieDomain } : {}),
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getSessionUserId(): Promise<string | null> {
  const c = cookies().get(SESSION_COOKIE)?.value;
  if (!c) return null;
  try {
    const { payload } = await jwtVerify(c, secret);
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  cookies().set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
