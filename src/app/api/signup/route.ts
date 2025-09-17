// src/app/api/signup/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { hashPassword } from "@/lib/password";
import { randomBytes } from "crypto";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs"; // Node runtime (crypto)

const prisma = new PrismaClient();

const FormSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(100),
});

function originFrom(headers: Headers) {
  return (
    process.env.APP_BASE_URL ||
    process.env.BASE_URL ||
    headers.get("origin") ||
    "http://localhost:3000"
  );
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const data = FormSchema.parse({
      email: String(form.get("email") || "").toLowerCase().trim(),
      password: String(form.get("password") || ""),
    });

    // If already verified, block duplicate signups
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing && existing.emailVerifiedAt) {
      return NextResponse.redirect(new URL("/login?error=exists", req.url), { status: 303 });
    }

    // Create or update the user with a fresh password hash
    const passwordHash = await hashPassword(data.password);
    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: { passwordHash },
      create: { email: data.email, passwordHash },
      select: { id: true, email: true },
    });

    // Create a 24h verification token (remove any previous)
    await prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } });
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
    await prisma.emailVerificationToken.create({
      data: { userId: user.id, token, expiresAt },
    });

    // Send verification email via Resend
    const verifyUrl = `${originFrom(req.headers)}/api/auth/verify?token=${token}`;
    const html = `
      <p>Confirm your email to finish creating your SnoutMarkets account.</p>
      <p><a href="${verifyUrl}">Verify my email</a></p>
      <p>This link expires in 24 hours.</p>
    `;
    try {
      await sendEmail(user.email, "Confirm your email", html);
    } catch (e) {
      console.error("verification email failed", e);
    }

    // Tell them to check their inbox
    return NextResponse.redirect(new URL("/login?verify=1", req.url), { status: 303 });
  } catch (e) {
    console.error("signup error", e);
    return NextResponse.redirect(new URL("/login?error=signup", req.url), { status: 303 });
  }
}
