// src/app/api/login/password/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

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

    // Try via Prisma first (now that passwordHash exists in the schema)
    const prismaUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, passwordHash: true },
    });

    if (prismaUser) {
      userId = prismaUser.id;
      hash = prismaUser.passwordHash ?? null;
    }

    // Fallback to a raw query in case the ORM path doesn’t return a hash
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

    // No hash on record -> invalid credentials
    if (!hash) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    // Compare supplied password against stored hash
    const ok = await bcrypt.compare(password, hash);
    if (!ok) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    // ✅ Password correct — set your session here if you have a helper
    // await createSession(userId!)
    // return NextResponse.redirect(new URL("/", req.url), { status: 303 })

    return NextResponse.json({ ok: true, userId });
  } catch {
    // Avoid leaking details
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
