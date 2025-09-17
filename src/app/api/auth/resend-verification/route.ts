// src/app/api/auth/resend-verification/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";
import { sendEmail } from "@/lib/email";

function originFrom(req: NextRequest) {
  return (
    process.env.APP_BASE_URL ||
    process.env.BASE_URL ||
    req.headers.get("origin") ||
    "http://localhost:3000"
  );
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const email = String(form.get("email") || "").toLowerCase().trim();
  if (!email) return NextResponse.json({ ok: false, error: "email required" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ ok: true });

  if ((user as any)?.emailVerifiedAt) {
    return NextResponse.json({ ok: true });
  }

  await prisma.magicLink.deleteMany({ where: { email } });
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);
  await prisma.magicLink.create({
    data: { email, token, expiresAt: expires },
  });

  const verifyUrl = `${originFrom(req)}/api/auth/verify?token=${token}`;
  const html = `
    <p>Confirm your email for SnoutMarkets.</p>
    <p><a href="${verifyUrl}">Verify my email</a></p>
  `;
  try {
    await sendEmail(email, "Confirm your email", html);
  } catch (e) {
    console.error("resend verification failed", e);
  }
  return NextResponse.json({ ok: true });
}
