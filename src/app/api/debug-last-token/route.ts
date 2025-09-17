// src/app/api/debug-last-token/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email")?.toLowerCase().trim();
  if (!email) {
    return NextResponse.json({ ok: false, error: "email required" }, { status: 400 });
  }
  const rec = await prisma.magicLink.findFirst({
    where: { email },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true, usedAt: true, expiresAt: true },
  });
  return NextResponse.json({ ok: true, found: !!rec, record: rec });
}
