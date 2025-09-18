import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPasswordReset } from "@/lib/password-reset";

const APP_URL = process.env.APP_URL ?? "http://localhost:3000"; // set in env
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;

// very simple memory RL (replace with redis if you have it)
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
    // Always respond 200 to avoid user enumeration
    return NextResponse.json({ ok: true });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Always respond success to avoid leaking which emails exist.
  if (!user) return NextResponse.json({ ok: true });

  const { raw, expiresAt } = await createPasswordReset(user.id, 30);
  const link = `${APP_URL}/reset-password?token=${raw}`;

  // TODO: replace with your mailer
  // await sendMail({ to: email, subject: "Reset your password", text: `Reset link: ${link}` });

  console.log("[DEV] Password reset link:", link, "expires", expiresAt.toISOString());

  return NextResponse.json({ ok: true });
}
