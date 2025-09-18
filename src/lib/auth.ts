// src/lib/auth.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export const SESSION_COOKIE = "snout_session";

function secretKey() {
  const raw = process.env.AUTH_SECRET || process.env.JWT_SECRET;
  if (!raw) {
    throw new Error("AUTH_SECRET (or JWT_SECRET) is not set");
  }
  return new TextEncoder().encode(raw);
}

/**
 * Create a signed session token and set it as a cookie.
 * Works in Route Handlers (with or without a NextResponse).
 * Returns the token so callers can use it if needed.
 */
export async function createSession(userId: string, res?: NextResponse): Promise<string> {
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
  };

  if (res) {
    res.cookies.set(SESSION_COOKIE, token, cookieOpts);
  } else {
    // In a route handler without an explicit NextResponse
    try {
      cookies().set(SESSION_COOKIE, token, cookieOpts);
    } catch {
      // ignore if not in a context that supports cookies()
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

/** Convenience: return a minimal user object or null. */
export async function getSessionUser(): Promise<{ id: string } | null> {
  const uid = await getSessionUserId();
  return uid ? { id: uid } : null;
}

/** Clear the session cookie (works with or without a NextResponse). */
export function clearSession(res?: NextResponse) {
  if (res) {
    res.cookies.delete(SESSION_COOKIE);
  } else {
    try {
      cookies().delete(SESSION_COOKIE);
    } catch {
      // ignore if not in a context that supports cookies()
    }
  }
}
