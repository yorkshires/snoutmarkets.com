// src/lib/auth.ts
import { cookies } from "next/headers";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const JWT_COOKIES = ["sm.session", "session"]; // keep both for compatibility
const UID_COOKIE = "sm_uid";

const rawSecret =
  process.env.JWT_SECRET || "jegkommerlangvejsfraogjegerfraenglandogdanmark";
const secret = new TextEncoder().encode(rawSecret);

type CookieOpts = {
  path?: string;
  httpOnly?: boolean;
  sameSite?: "lax" | "strict" | "none";
  secure?: boolean;
  domain?: string;
  maxAge?: number;
};

function baseCookie(): CookieOpts {
  const secure = process.env.NODE_ENV === "production";
  const opts: CookieOpts = {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure,
  };
  const domain = process.env.COOKIE_DOMAIN;
  if (domain) opts.domain = domain;
  return opts;
}

export async function createSession(userId: string) {
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30; // 30 days
  const token = await new SignJWT({ sub: userId } as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(secret);

  const jar = cookies();
  const opts = { ...baseCookie(), maxAge: 60 * 60 * 24 * 30 };

  for (const name of JWT_COOKIES) {
    jar.set(name, token, opts as any);
  }
  // helper cookie (readable on client)
  jar.set(UID_COOKIE, userId, { ...opts, httpOnly: false } as any);
}

export async function getSessionUserId(): Promise<string | null> {
  const jar = cookies();
  for (const name of JWT_COOKIES) {
    const value = jar.get(name)?.value;
    if (!value) continue;
    try {
      const { payload } = await jwtVerify(value, secret);
      const sub = payload.sub as string | undefined;
      if (sub) return sub;
    } catch {
      // ignore and try next
    }
  }
  return jar.get(UID_COOKIE)?.value ?? null;
}

export function clearSession() {
  const jar = cookies();
  const opts = { ...baseCookie(), maxAge: 0 };
  for (const name of JWT_COOKIES) jar.set(name, "", opts as any);
  jar.set(UID_COOKIE, "", { ...opts, httpOnly: false } as any);
}
