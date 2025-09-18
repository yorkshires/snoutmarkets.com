// src/lib/auth.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { prisma } from "@/lib/db";

export const SESSION_COOKIE = "snout_session";

function secretKey() {
  // Support any of these env names to avoid breakage
  const raw =
    process.env.AUTH_SECRET ||
    process.env.JWT_SECRET ||
    process.env.SESSION_SECRET;
  if (!raw) {
    throw new Error("AUTH_SECRET / JWT_SECRET / SESSION_SECRET is not set");
  }
  return new TextEncoder().encode(raw);
}

/**
 * Create a signed session token and set it as a cookie.
 * Works in Route Handlers (with or without a NextResponse).
 * Returns the token so callers can use it if needed.
 */
export async function createSession(
  userId: string,
  res?: NextResponse
): Promise<string> {
  const token = await new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKey());

  const cookieOpts = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    domain: process.env.COOKIE_DOMAIN || undefined,
  };

  if (res) {
    res.cookies.set(SESSION_COOKIE, token, cookieOpts);
  } else {
    try {
      cookies().set(SESSION_COOKIE, token, cookieOpts);
    } catch {
      // ignore if not in a cookies() context
    }
  }
  return token;
}

/** Verify the current session cookie and return the user id (or null). */
export async function getSessionUserId(): Promise<string | null> {
  try {
    const token = cookies().get(SESSION_COOKIE)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secretKey());
    return (payload as JWTPayload & { uid?: string }).uid ?? null;
  } catch {
    return null;
  }
}

/** Return `{ id, email }` of the logged-in user, or `null` if no session. */
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

/** Clear the session cookie (works with or without a NextResponse). */
export function clearSession(res?: NextResponse) {
  const opts = { path: "/", domain: process.env.COOKIE_DOMAIN || undefined };
  if (res) {
    res.cookies.set(SESSION_COOKIE, "", { ...opts, maxAge: 0 });
  } else {
    try {
      cookies().set(SESSION_COOKIE, "", { ...opts, maxAge: 0 });
    } catch {
      // ignore if not in a cookies() context
    }
  }
}
