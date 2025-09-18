// src/app/api/auth/register/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/passwords";
import { sendEmail } from "@/lib/mailer";
import { makeVerifyToken } from "@/lib/verify";

function baseUrl(req: NextRequest) {
  // Prefer APP_BASE_URL, else derive from request
  const envUrl = process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl) return envUrl;
  const u = new URL(req.url);
  return `${u.protocol}//${u.host}`;
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const email = String(form.get("email") || "").toLowerCase().trim();
    const password = String(form.get("password") || "");

    if (!email || !password) {
      return NextResponse.redirect(new URL("/login?error=invalid", req.url));
    }

    const passwordHash = await hashPassword(password);

    // Upsert user (unverified by default)
    const user = await prisma.user.upsert({
      where: { email },
      update: { passwordHash, emailVerified: false },
      create: { email, passwordHash, emailVerified: false },
      select: { id: true, email: true },
    });

    // Build verification link
    const token = await makeVerifyToken(email);
    const verifyUrl = `${baseUrl(req)}/api/auth/verify?token=${encodeURIComponent(
      token
    )}`;

    // Send email and CHECK the result
    await sendEmail({
      to: email,
      subject: "Verify your email — SnoutMarkets",
      html: `
        <div style="font-family:system-ui;line-height:1.6">
          <p>Hi,</p>
          <p>Click the button below to verify your email and finish creating your account.</p>
          <p><a href="${verifyUrl}" style="background:#f05a0e;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;display:inline-block">Verify my email</a></p>
          <p>Or paste this link into your browser:<br>${verifyUrl}</p>
        </div>
      `,
    });

    // Success banner
    return NextResponse.redirect(
      new URL("/login?info=verification-sent", req.url)
    );
  } catch (e: any) {
    console.error("register error:", e);
    // Surface exact error so you can see what's wrong in UI/logs
    const msg = encodeURIComponent(String(e?.message || "server"));
    return NextResponse.redirect(new URL(`/login?error=${msg}`, req.url));
  }
}
