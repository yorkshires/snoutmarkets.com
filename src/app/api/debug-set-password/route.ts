// src/app/api/debug-set-password/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";

// Use env when present, otherwise fall back to your provided token.
const EXPECTED_TOKEN =
  process.env.DEBUG_ADMIN_TOKEN || "monikkedetsnarterfærdigt";

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("x-debug-token");
    if (!token || token !== EXPECTED_TOKEN) {
      return NextResponse.json(
        { ok: false, error: "unauthorized" },
        { status: 401 }
      );
    }

    const form = await req.formData();
    const email = String(form.get("email") || "").toLowerCase().trim();
    const password = String(form.get("password") || "");
    const verify = String(form.get("verify") || "") === "1";

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "email and password required" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Build update/create data. `any` lets us add emailVerifiedAt when needed.
    const data: any = { passwordHash };
    if (verify) data.emailVerifiedAt = new Date();

    await prisma.user.upsert({
      where: { email },
      update: data,
      create: { email, ...data },
    });

    // Fetch a minimal, always-safe shape
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    return NextResponse.json({
      ok: true,
      user,
      verifyApplied: verify,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}
