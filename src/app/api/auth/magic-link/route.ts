// src/app/api/auth/magic-link/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const email = String(form.get("email") || "").toLowerCase().trim();

  if (!email) {
    return NextResponse.json({ ok: false, error: "Email is required." }, { status: 400 });
  }

  // Require mail to be configured (no dev links)
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "Email delivery is not configured." },
      { status: 500 }
    );
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // Create token first
  await prisma.magicLink.create({ data: { token, email, expiresAt } });

  const base =
    (process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin).replace(/\/$/, "");
  const link = `${base}/api/auth/callback?token=${token}`;
  const from = process.env.FROM_EMAIL || "SnoutMarkets <noreply@snoutmarkets.com>";

  const html = `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; line-height:1.5; color:#0f172a;">
      <h2 style="margin:0 0 12px 0;">Verify your email</h2>
      <p style="margin:0 0 16px 0;">Click the button below to sign in to <strong>SnoutMarkets</strong>. 
      This link expires in <strong>15 minutes</strong>.</p>
      <p>
        <a href="${link}"
          style="display:inline-block;padding:12px 18px;border-radius:8px;background:#ea580c;color:#fff;
                 text-decoration:none;font-weight:600">
          Sign in
        </a>
      </p>
      <p style="font-size:13px;color:#475569;margin-top:20px">
        If the button doesn't work, copy and paste this URL into your browser:<br/>
        <span style="word-break:break-all">${link}</span>
      </p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0"/>
      <p style="font-size:12px;color:#64748b;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;

  try {
    // Send via Resend HTTP API
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: email,
        subject: "Sign in to SnoutMarkets",
        html,
      }),
    });

    if (!resp.ok) {
      // Clean up the token if sending fails
      await prisma.magicLink.delete({ where: { token } });
      return NextResponse.json(
        { ok: false, error: "We couldn't send the email. Please try again." },
        { status: 502 }
      );
    }
  } catch {
    await prisma.magicLink.delete({ where: { token } });
    return NextResponse.json(
      { ok: false, error: "We couldn't send the email. Please try again." },
      { status: 502 }
    );
  }

  // Do not reveal the link in responses
  return NextResponse.json({ ok: true });
}
