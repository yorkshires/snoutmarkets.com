// src/app/api/auth/magic-link/route.ts  (replace entire file)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const email = String(form.get("email") || "").toLowerCase().trim();

  if (!email) {
    return NextResponse.json({ ok: false, error: "Email is required." }, { status: 400 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { ok: false, error: "Email delivery is not configured." },
      { status: 500 }
    );
  }

  const token = `ml_${randomBytes(32).toString("hex")}`;
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await prisma.magicLink.create({ data: { token, email, expiresAt } });

  const base = (process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin).replace(/\/$/, "");
  const link = `${base}/api/auth/callback?token=${token}`;
  const from = process.env.FROM_EMAIL || "SnoutMarkets <noreply@snoutmarkets.com>";

  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.5;color:#0f172a">
      <h2 style="margin:0 0 12px">Verify your email</h2>
      <p style="margin:0 0 12px">Click the button below to sign in. This link expires in <strong>15 minutes</strong>.</p>
      <p><a href="${link}" style="display:inline-block;padding:12px 18px;border-radius:8px;background:#ea580c;color:#fff;text-decoration:none;font-weight:600">Sign in</a></p>
    </div>
  `;

  await sendEmail(email, "Sign in to SnoutMarkets", html);

  return NextResponse.json({ ok: true });
}
