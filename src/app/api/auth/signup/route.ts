// src/app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { hashPassword } from "@/lib/passwords";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const email = String(form.get("email") || "").toLowerCase().trim();
  const password = String(form.get("password") || "");

  if (!email || !password) {
    return NextResponse.redirect(new URL("/login?error=invalid", req.url));
  }

  // If already exists with password, block duplicate signups
  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true },
  });
  if (existing?.passwordHash) {
    return NextResponse.redirect(new URL("/login?error=exists", req.url));
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
    select: { id: true },
  });

  await createSession(user.id);
  return NextResponse.redirect(new URL("/", req.url));
}
