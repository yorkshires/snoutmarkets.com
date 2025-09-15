// src/lib/auth.ts
import { cookies } from "next/headers";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const JWT_COOKIES = ["sm.session", "session"]; // sæt begge for kompatibilitet
const UID_COOKIE = "sm_uid";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-change-me"
);

function baseCookieOptions() {
  const secure = process.env.NODE_ENV === "production";
  const opts: Record<string, any> = {
    path: "/",
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 30, // 30 dage
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

  // HttpOnly JWT (begge navne for at matche forskellige checks i koden)
  for (const name of JWT_COOKIES) {
    jar.set(name, token, baseCookieOptions());
  }

  // Ikke-HttpOnly UID (UI og API’er læser denne flere steder)
  const uidOpts = { ...baseCookieOptions(), httpOnly: false };
  jar.set(UID_COOKIE, userId, uidOpts);
}

export async function getSessionUserId(): Promise<string | null> {
  const jar = cookies();

  // prøv JWT-cookies
  for (const name of JWT_COOKIES) {
    const raw = jar.get(name)?.value;
    if (!raw) continue;
    try {
      const { payload } = await jwtVerify(raw, secret, { algorithms: ["HS256"] });
      if (typeof payload.sub === "string" && payload.sub) return payload.sub;
    } catch {
      // prøv næste
    }
  }

  // fallback til sm_uid hvis sat
  return jar.get(UID_COOKIE)?.value ?? null;
}

export function clearSession() {
  const jar = cookies();
  const opts = { ...baseCookieOptions(), maxAge: 0 };
  for (const name of JWT_COOKIES) jar.set(name, "", opts);
  jar.set(UID_COOKIE, "", { ...opts, httpOnly: false });
}
