// src/app/api/debug-auth/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/passwords";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const email = String(form.get("email") || "").toLowerCase().trim();
    const password = String(form.get("password") || "");

    if (!email || !password) {
      return NextResponse.json({ ok: false, step: "input", error: "missing email or password" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, passwordHash: true },
    });
    if (!user) return NextResponse.json({ ok: false, step: "find", error: "user-not-found" }, { status: 404 });

    if (!user.passwordHash) {
      return NextResponse.json({ ok: false, step: "hash", error: "no-password-hash" }, { status: 400 });
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ ok: false, step: "compare", error: "wrong-password" }, { status: 401 });
    }

    return NextResponse.json({ ok: true, step: "done", userId: user.id });
  } catch (e: any) {
    return NextResponse.json({ ok: false, step: "server", error: String(e?.message || e) }, { status: 500 });
  }
}
