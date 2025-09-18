// src/app/api/debug-user-hash/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const email = new URL(req.url).searchParams.get("email")?.toLowerCase().trim();
  if (!email) {
    return NextResponse.json({ ok: false, error: "email query param required" }, { status: 400 });
  }
  const user = await prisma.user.findUnique({
    where: { email },
    select: { passwordHash: true },
  });
  if (!user) return NextResponse.json({ ok: true, exists: false });

  const h = user.passwordHash || "";
  const prefix = h.slice(0, 16);
  const alg =
    h.startsWith("$2") ? "bcrypt" :
    h.startsWith("$argon2") ? "argon2" :
    "unknown";

  return NextResponse.json({
    ok: true,
    exists: true,
    alg,
    prefix,
    length: h.length,
  });
}
