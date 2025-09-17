// src/app/api/signup/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { hashPassword } from "@/lib/password";
import { randomBytes } from "crypto";
import { sendEmail } from "@/lib/email";

const prisma = new PrismaClient();

const FormSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(100),
});

function baseUrl(headers: Headers) {
  // Prefer explicit envs, then Host/Proto
  const env =
    process.env.APP_BASE_URL ||
    process.env.BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env;
  const host = headers.get("x-forwarded-host") || headers.get("host");
  const proto = (headers.get("x-forwarded-proto") || "https").split(",")[0].trim();
  return host ? `${proto}://${host}` : "http://localhost:3000";
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const data = FormSchema.parse({
      email: String(form.get("email") || "").toLowerCase().trim(),
      password: String(form.get("password") || ""),
    });

    // If already verified, send to login with message
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing && (existing as any).emailVerifiedAt) {
      const url = new URL("/login", baseUrl(req.headers));
      url.searchParams.set("error", "exists");
      url.searchParams.set("email", data.email);
      return NextResponse.redirect(url, { status: 303 });
    }

    // Create/update user with password
    const passwordHash = await hashPassword(data.password);
    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: { passwordHash },
      create: { email: data.email, passwordHash },
      select: { id: true, email: true },
    });

    // Make/replace verification token (use MagicLink table)
    await prisma.magicLink.deleteMany({ where: { email: user.email } });
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
    await prisma.magicLink.create({
      data: { email: user.email, token, expiresAt },
    });

    // Build links using absolute base
    const base = baseUrl(req.headers);
    const verifyUrl = new URL("/api/auth/verify", base);
    verifyUrl.searchParams.set("token", token);

    const html = `
      <p>Confirm your email to finish creating your SnoutMarkets account.</p>
      <p><a href="${verifyUrl.toString()}">Verify my email</a></p>
      <p>This link expires in 24 hours.</p>
    `;

    let sentOk = true;
    try {
      await sendEmail(user.email, "Confirm your email", html);
    } catch (e) {
      sentOk = false;
      console.error("verification email failed", e);
    }

    // ALWAYS redirect with verify=1 & email=… (even if sending failed)
    const loginUrl = new URL("/login", base);
    loginUrl.searchParams.set("verify", "1");
    loginUrl.searchParams.set("email", user.email);
    if (!sentOk) loginUrl.searchParams.set("sent", "0");
    return NextResponse.redirect(loginUrl, { status: 303 });
  } catch (e) {
    console.error("signup error", e);
    const url = new URL("/login", baseUrl(req.headers));
    url.searchParams.set("error", "signup");
    return NextResponse.redirect(url, { status: 303 });
  }
}
