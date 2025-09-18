// src/app/api/auth/register/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/passwords";
import { sendEmail } from "@/lib/mailer";
import { makeVerifyToken } from "@/lib/verify";

function baseUrl(req: NextRequest) {
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

    // Upsert WITHOUT emailVerified (your schema doesn't have it)
    await prisma.user.upsert({
      where: { email },
      update: { passwordHash },
      create: { email, passwordHash },
      select: { id: true }, // just to keep the call typed
    });

    // Build verification link (informational – no DB flag toggled)
    const token = await makeVerifyToken(email);
    const verifyUrl = `${baseUrl(req)}/api/auth/verify?token=${encodeURIComponent(
      token
    )}`;

    await sendEmail({
      to: email,
      subject: "Verify your email — SnoutMarkets",
      html: `
        <div style="font-family:system-ui;line-height:1.6">
          <p>Hi,</p>
          <p>Click the button below to confirm this email belongs to you.</p>
          <p><a href="${verifyUrl}" style="background:#f05a0e;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;display:inline-block">Verify my email</a></p>
          <p>Or paste this link into your browser:<br>${verifyUrl}</p>
        </div>
      `,
    });

    return NextResponse.redirect(
      new URL("/login?info=verification-sent", req.url)
    );
  } catch (e: any) {
    console.error("register error:", e);
    const msg = encodeURIComponent(String(e?.message || "server"));
    return NextResponse.redirect(new URL(`/login?error=${msg}`, req.url));
  }
}
