// src/app/api/auth/password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const email = String(form.get("email") || "").toLowerCase().trim();
  const password = String(form.get("password") || "");

  if (!email || !password) {
    return NextResponse.redirect(new URL("/login?error=invalid", req.url));
  }

  const allowedEmail = (process.env.AUTH_EMAIL || "").toLowerCase().trim();
  const allowedPass = process.env.AUTH_PASSWORD || "demo";

  const ok =
    (allowedEmail && email === allowedEmail && password === allowedPass) ||
    (!allowedEmail && password === allowedPass);

  if (!ok) {
    return NextResponse.redirect(new URL("/login?error=invalid", req.url));
  }

  // Ensure a user record exists
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
    select: { id: true },
  });

  await createSession(user.id);
  return NextResponse.redirect(new URL("/", req.url));
}
