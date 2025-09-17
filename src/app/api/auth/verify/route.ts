// src/app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/login?error=invalid", req.url));
  }

  const record = await prisma.emailVerificationToken.findUnique({ where: { token } });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return NextResponse.redirect(new URL("/login?error=expired", req.url));
  }

  await prisma.$transaction(async (tx) => {
    await tx.emailVerificationToken.update({
      where: { token },
      data: { usedAt: new Date() },
    });
    // Cast only this update so TS compiles even if the field isn't in the generated types yet
    await tx.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: new Date() } as any,
    });
  });

  await createSession(record.userId);
  return NextResponse.redirect(new URL("/account/listings", req.url));
}
