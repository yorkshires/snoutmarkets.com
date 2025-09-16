// src/app/api/auth/password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { verifyPassword } from "@/lib/passwords";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const email = String(form.get("email") || "").toLowerCase().trim();
  const password = String(form.get("password") || "");

  if (!email || !password) {
    return NextResponse.redirect(new URL("/login?error=invalid", req.url));
  }

  // 1) Real user with passwordHash?
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true },
  });

  if (user?.passwordHash && (await verifyPassword(password, user.passwordHash))) {
    await createSession(user.id);
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 2) DEV whitelist via env (keeps your previous behavior)
  const allowedEmail = (process.env.AUTH_EMAIL || "").toLowerCase().trim();
  const allowedPass = process.env.AUTH_PASSWORD || "demo";
  const allowed =
    (allowedEmail && email === allowedEmail && password === allowedPass) ||
    (!allowedEmail && password === allowedPass);

  if (allowed) {
    // ensure user exists
    const u = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email },
      select: { id: true },
    });
    await createSession(u.id);
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 3) Fail
  return NextResponse.redirect(new URL("/login?error=invalid", req.url));
}
