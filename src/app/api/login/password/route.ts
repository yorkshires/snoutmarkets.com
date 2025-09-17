// src/app/api/login/password/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyPassword, hashPassword } from "@/lib/password";
import { SignJWT } from "jose";

export const runtime = "nodejs"; // Node runtime (crypto enabled)

const prisma = new PrismaClient();

// --- Hard defaults (env can override) ---
const JWT_SECRET =
  process.env.JWT_SECRET || "jegkommerlangvejsfraogjegerfraenglandogdanmark";
const COOKIE_DOMAIN =
  process.env.COOKIE_DOMAIN || "snoutmarkets.com";
// ---------------------------------------

function buildSessionCookie(token: string, req: Request) {
  const maxAge = 60 * 60 * 24 * 30; // 30 days
  const url = new URL(req.url);
  const isHttps = url.protocol === "https:";
  const host = url.hostname;

  const attrs = [
    `session=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
  ];

  // Only mark Secure when we are on HTTPS (e.g., production)
  if (isHttps) attrs.push("Secure");

  // Set Domain if the current host matches/ends with COOKIE_DOMAIN
  // (avoids breaking localhost dev cookies)
  if (host === COOKIE_DOMAIN || host.endsWith(`.${COOKIE_DOMAIN}`)) {
    attrs.push(`Domain=${COOKIE_DOMAIN}`);
  }

  return attrs.join("; ");
}

async function signJwt(userId: string) {
  if (!JWT_SECRET) throw new Error("Missing JWT secret");
  const key = new TextEncoder().encode(JWT_SECRET);
  return await new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(key);
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const email = String(form.get("email") || "").trim().toLowerCase();
    const password = String(form.get("password") || "");

    if (!email || !password) {
      return NextResponse.redirect(new URL("/login?error=invalid", req.url), { status: 303 });
    }

    // Look up user
    let user = await prisma.user.findUnique({ where: { email } });

    // Dev fallback #1: AUTH_EMAIL/AUTH_PASSWORD
    const authEmail = (process.env.AUTH_EMAIL || "").toLowerCase();
    const authPass = process.env.AUTH_PASSWORD || "";
    if (!user && email === authEmail && authPass && password === authPass) {
      user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: { email, passwordHash: await hashPassword(password) },
      });
    }

    // Dev fallback #2: allow "demo" password in non-production if user missing
    if (!user) {
      const isDev = process.env.NODE_ENV !== "production";
      if (isDev && password === "demo") {
        user = await prisma.user.upsert({
          where: { email },
          update: {},
          create: { email, passwordHash: await hashPassword("demo") },
        });
      } else {
        return NextResponse.redirect(new URL("/login?error=notfound", req.url), { status: 303 });
      }
    }

    // Verify password hash (if present)
    if (user.passwordHash) {
      const ok = await verifyPassword(password, user.passwordHash);
      if (!ok) {
        return NextResponse.redirect(new URL("/login?error=badcreds", req.url), { status: 303 });
      }
    } else {
      // No hash saved: only allow dev "demo" in non-production
      const isDev = process.env.NODE_ENV !== "production";
      if (!(isDev && password === "demo")) {
        return NextResponse.redirect(new URL("/login?error=badcreds", req.url), { status: 303 });
      }
    }

    // Sign session token and set cookie
    const token = await signJwt(user.id);
    const res = NextResponse.redirect(new URL("/", req.url), { status: 303 });
    res.headers.append("Set-Cookie", buildSessionCookie(token, req));
    return res;
  } catch (err) {
    console.error("password login error", err);
    return NextResponse.redirect(new URL("/login?error=server", req.url), { status: 303 });
  }
}
