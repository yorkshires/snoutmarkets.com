// src/app/api/login/password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const email = String(form.get("email") || "").toLowerCase().trim();
  const password = String(form.get("password") || "");

  if (!email || !password) {
    return NextResponse.redirect(new URL("/login?error=invalid", req.url));
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    return NextResponse.redirect(new URL("/login?error=badcreds", req.url));
  }

  if (!user.emailVerifiedAt) {
    // Not verified yet
    return NextResponse.redirect(new URL("/login?error=verify", req.url));
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return NextResponse.redirect(new URL("/login?error=badcreds", req.url));
  }

  await createSession(user.id);
  return NextResponse.redirect(new URL("/", req.url));
}
