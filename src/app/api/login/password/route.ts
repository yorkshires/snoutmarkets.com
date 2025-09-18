// src/app/api/login/password/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signSession, COOKIE_NAME } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");

    if (!email || !password) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    let userId: string | null = null;
    let hash: string | null = null;

    const prismaUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, passwordHash: true },
    });
    if (prismaUser) {
      userId = prismaUser.id;
      hash = prismaUser.passwordHash ?? null;
    }

    if (!hash) {
      const rows = await prisma.$queryRawUnsafe<
        { id: string; passwordhash: string | null }[]
      >(
        `SELECT id, "passwordHash" AS passwordhash
           FROM "public"."User"
          WHERE email = $1
          LIMIT 1`,
        email
      );

      if (rows?.length) {
        userId = rows[0].id ?? null;
        hash = rows[0].passwordhash ?? null;
      }
    }

    if (!hash) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, hash);
    if (!ok) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    // ✅ Issue session + redirect
    const token = await signSession(userId!);
    const res = NextResponse.redirect(new URL("/", req.url), { status: 303 });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    return res;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
