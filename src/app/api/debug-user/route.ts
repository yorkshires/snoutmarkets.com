// src/app/api/debug-user/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const email = new URL(req.url).searchParams.get("email")?.toLowerCase().trim();
  if (!email) {
    return NextResponse.json({ ok: false, error: "email query param required" }, { status: 400 });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, passwordHash: true },
    });
    if (!user) return NextResponse.json({ ok: true, exists: false });

    return NextResponse.json({
      ok: true,
      exists: true,
      id: user.id,
      hasPasswordHash: !!user.passwordHash,
      passwordHashLength: user.passwordHash?.length ?? 0,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
