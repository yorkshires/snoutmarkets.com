// src/app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/login?error=invalid", req.url));
  }

  // Read from MagicLink table
  const record = await prisma.magicLink.findUnique({ where: { token } });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return NextResponse.redirect(new URL("/login?error=expired", req.url));
  }

  const user = await prisma.user.findUnique({ where: { email: record.email } });
  if (!user) {
    return NextResponse.redirect(new URL("/login?error=invalid", req.url));
  }

  await prisma.$transaction(async (tx) => {
    await tx.magicLink.update({
      where: { token },
      data: { usedAt: new Date() },
    });
    await tx.user.update({
      where: { id: user.id },
      data: { emailVerifiedAt: new Date() } as any,
    });
  });

  await createSession(user.id);
  return NextResponse.redirect(new URL("/account/listings", req.url));
}
