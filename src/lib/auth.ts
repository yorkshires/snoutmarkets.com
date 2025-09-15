// src/lib/auth.ts
import { cookies } from "next/headers";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export const SESSION_COOKIE = "sm.session";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-change-me"
);

// fælles cookie-options
function baseCookie() {
  const secure = process.env.NODE_ENV === "production";
  const opts: Record<string, any> = {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
  };
  const domain = process.env.COOKIE_DOMAIN?.trim();
  if (domain) opts.domain = domain; // fx snoutmarkets-com.vercel.app
  return opts;
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId } as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);

  const jar = cookies();

  // HttpOnly JWT til serverside beskyttede ruter
  jar.set(SESSION_COOKIE, token, { ...baseCookie(), maxAge: 60 * 60 * 24 * 30 });

  // Ikke-HttpOnly uid (din app læser denne nogle steder i UI/API)
  jar.set("sm_uid", userId, {
    ...baseCookie(),
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getSessionUserId(): Promise<string | null> {
  const jar = cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) return jar.get("sm_uid")?.value ?? null;

  try {
    const { payload } = await jwtVerify(raw, secret, { algorithms: ["HS256"] });
    const sub = payload.sub;
    return typeof sub === "string" && sub.length > 0 ? sub : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  const jar = cookies();
  jar.set(SESSION_COOKIE, "", { ...baseCookie(), maxAge: 0 });
  jar.set("sm_uid", "", { ...baseCookie(), httpOnly: false, maxAge: 0 });
}
