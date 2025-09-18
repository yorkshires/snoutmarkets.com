// src/lib/auth.ts
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { prisma } from "@/lib/db";

export const SESSION_COOKIE = "snout_session";

function secretKey() {
  const raw =
    process.env.AUTH_SECRET ||
    process.env.JWT_SECRET ||
    process.env.SESSION_SECRET;
  if (!raw) throw new Error("Set AUTH_SECRET/JWT_SECRET/SESSION_SECRET");
  return new TextEncoder().encode(raw);
}

type SessionPayload = JWTPayload & { uid: string };

function cookieDomainForCurrentHost(): string | undefined {
  const want = (process.env.COOKIE_DOMAIN || "").toLowerCase();
  if (!want) return undefined;

  // Current request host (works in RSC/route handlers)
  const h = headers().get("host")?.toLowerCase();
  if (!h) return undefined;

  // Only set an explicit domain when the current host ends with it (prod).
  if (h === want || h.endsWith(`.${want}`)) return want;

  // On preview / localhost, don't set a domain (let browser default).
  return undefined;
}

export async function createSession(userId: string, res?: NextResponse) {
  const token = await new SignJWT({ uid: userId } as SessionPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKey());

  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    domain: cookieDomainForCurrentHost(),
  };

  if (res) res.cookies.set(SESSION_COOKIE, token, cookieOpts);
  else cookies().set(SESSION_COOKIE, token, cookieOpts);
}

export async function getSessionUserId(): Promise<string | null> {
  try {
    const token = cookies().get(SESSION_COOKIE)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secretKey());
    return (payload as SessionPayload).uid ?? null;
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<{ id: string; email: string } | null> {
  const uid = await getSessionUserId();
  if (!uid) return null;
  try {
    const user = await prisma.user.findUnique({
      where: { id: uid },
      select: { id: true, email: true },
    });
    return user ?? null;
  } catch {
    return null;
  }
}

export function clearSession(res?: NextResponse) {
  const opts = {
    path: "/",
    maxAge: 0,
    domain: cookieDomainForCurrentHost(),
  };
  if (res) res.cookies.set(SESSION_COOKIE, "", opts);
  else cookies().set(SESSION_COOKIE, "", opts);
}
