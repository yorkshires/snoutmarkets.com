// src/app/api/auth/callback/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token") ?? "";

  const base =
    process.env.APP_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    `http://${req.headers.get("host") ?? "localhost:3000"}`;

  if (!token) {
    return NextResponse.redirect(`${base}/login?error=token`);
  }

  const record = await prisma.magicLink.findFirst({
    where: {
      token,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    select: { id: true, userId: true },
  });

  if (!record) {
    return NextResponse.redirect(`${base}/login?error=invalid`);
  }

  // markér brugt
  await prisma.magicLink.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  // opret session-cookie
  await createSession(record.userId);

  // send videre (ændr evt. til /sell/new)
  return NextResponse.redirect(`${base}/account`);
}
