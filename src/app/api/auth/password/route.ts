// src/app/api/auth/password/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { verifyPassword } from "@/lib/passwords";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const email = String(form.get("email") || "").toLowerCase().trim();
    const password = String(form.get("password") || "");

    if (!email || !password) {
      return NextResponse.redirect(new URL("/login?error=invalid", req.url));
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, passwordHash: true },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.redirect(new URL("/login?error=badcreds", req.url));
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.redirect(new URL("/login?error=badcreds", req.url));
    }

    const res = NextResponse.redirect(new URL("/", req.url));
    await createSession(user.id, res);
    return res;
  } catch (err) {
    console.error("auth/password login error", err);
    return NextResponse.redirect(new URL("/login?error=server", req.url));
  }
}
