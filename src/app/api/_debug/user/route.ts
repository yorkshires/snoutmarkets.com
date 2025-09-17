export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const email = new URL(req.url).searchParams.get("email")?.toLowerCase().trim();
  if (!email) return NextResponse.json({ ok: false, error: "missing email" }, { status: 400 });

  try {
    const user = await prisma.user.findFirst({
      where: { email },
      select: { id: true, email: true },
    });
    return NextResponse.json({ ok: true, user: user ?? null });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
