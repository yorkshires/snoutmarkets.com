// src/app/api/auth/request-password-reset/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createPasswordResetToken } from "@/lib/password-reset";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({}));
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: { id: true, email: true },
  });

  // Always respond 200 to prevent user enumeration
  if (!user) return NextResponse.json({ ok: true });

  const { token, expiresAt } = await createPasswordResetToken(user.email, 30);

  const base = (process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin).replace(/\/$/, "");
  const link = `${base}/reset-password?token=${token}`;

  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.5;color:#0f172a">
      <h2 style="margin:0 0 12px">Reset your password</h2>
      <p style="margin:0 0 12px">Click the button below to set a new password. This link expires at <strong>${expiresAt.toISOString()}</strong>.</p>
      <p><a href="${link}" style="display:inline-block;padding:12px 18px;border-radius:8px;background:#ea580c;color:#fff;text-decoration:none;font-weight:600">Reset password</a></p>
      <p style="font-size:13px;color:#475569;margin-top:16px">If you didn’t request this, you can ignore this email.</p>
    </div>
  `;

  try {
    await sendEmail(user.email, "Reset your password", html);
  } catch (e) {
    // Don't leak delivery errors to the client
    console.error("sendEmail error:", e);
  }

  return NextResponse.json({ ok: true });
}
