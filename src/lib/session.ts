// src/lib/session.ts
import { SignJWT, jwtVerify } from "jose";

export const COOKIE_NAME = "sm_sess";

function getKey() {
  // REQUIRED: add SESSION_SECRET in Vercel (32+ random chars)
  const secret = process.env.SESSION_SECRET || "";
  if (!secret) throw new Error("SESSION_SECRET is missing");
  return new TextEncoder().encode(secret);
}

export async function signSession(userId: string) {
  const key = getKey();
  return await new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(key);
}

export async function verifySession(token: string) {
  const key = getKey();
  const { payload } = await jwtVerify(token, key);
  return payload as { uid: string };
}
