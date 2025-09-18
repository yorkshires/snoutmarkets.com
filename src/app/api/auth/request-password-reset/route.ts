// src/app/api/auth/request-password-reset/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createPasswordReset } from "@/lib/password-reset";
import { sendEmail } from "@/lib/email";

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;

// very simple in-memory rate limiter (use redis in prod)
const rl = new Map<string, { count: number; ts: number }>();

function rateLimited(key: string) {
  const now = Date.now();
  const rec = rl.get(key);
  if (!rec || now - rec.ts > RATE_LIMIT_WINDOW_MS) {
    rl.set(key, { count: 1, ts: now });
    return false;
  }
  rec.count++;
  rec.ts = now;
  return rec.count > RATE_LIMIT_MAX;
}

export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({}));
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const key = `r:${email}`;
  if (rateLimited(key)) {
    // Always 200 to avoid user enumeration
    return NextResponse.json({ ok: true });
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user) {
    // Always 200 to avoid leaking which emails exist
    return NextResponse.json({ ok: true });
  }

  const { raw, expiresAt } = await createPasswordReset(user.id, 30);
  const link = `${APP_URL}/reset-password?token=${raw}`;

  // send email via your existing lib
  try {
    await sendEmail(
      email,
      "Reset your password",
      `<p>Click the link below to reset your password. This link expires at ${expiresAt.toISOString()}.</p>
       <p><a href="${link}">${link}</a></p>`
    );
  } catch (e) {
    // Still return ok (don’t leak), but log for ops
    console.error("sendEmail error:", e);
  }

  return NextResponse.json({ ok: true });
}
