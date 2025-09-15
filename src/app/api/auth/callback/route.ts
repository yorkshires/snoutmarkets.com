// src/app/api/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/login?error=invalid", req.url));
  }

  const record = await prisma.magicLink.findUnique({ where: { token } });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return NextResponse.redirect(new URL("/login?error=expired", req.url));
  }

  await prisma.magicLink.update({
    where: { token },
    data: { usedAt: new Date() },
  });

  const user = await prisma.user.upsert({
    where: { email: record.email },
    update: {},
    create: { email: record.email },
  });

  await createSession(user.id);
  return NextResponse.redirect(new URL("/account/listings", req.url));
}
