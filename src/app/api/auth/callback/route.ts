// src/app/api/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.redirect(new URL("/login?error=token", req.url));

  const link = await prisma.magicLink.findUnique({ where: { token } });
  if (!link || link.usedAt || link.expiresAt < new Date()) {
    return NextResponse.redirect(new URL("/login?error=expired", req.url));
  }

  // markér som brugt
  await prisma.magicLink.update({
    where: { token },
    data: { usedAt: new Date() },
  });

  // opret/find bruger
  const user = await prisma.user.upsert({
    where: { email: link.email },
    update: {},
    create: { email: link.email },
  });

  // sæt både JWT og sm_uid cookies
  await createSession(user.id);

  // tydelig destination efter login
  return NextResponse.redirect(new URL("/account/listings", req.url));
}
