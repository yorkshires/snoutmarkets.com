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

    //
    // Try to fetch the password hash via Prisma first. If your Prisma
    // model doesn't expose `passwordHash` yet, we'll fall back to raw SQL.
    //
    let userId: string | null = null;
    let hash: string | null = null;

    try {
      // NOTE: casting `select` as any to avoid TS errors if your Prisma
      // model hasn't been regenerated with the `passwordHash` field yet.
      const prismaUser = (await prisma.user.findUnique({
        where: { email },
        // @ts-expect-error - tolerate until schema is regenerated
        select: { id: true, passwordHash: true } as any,
      })) as any;

      if (prismaUser) {
        userId = prismaUser.id ?? null;
        hash = prismaUser.passwordHash ?? null;
      }
    } catch {
      // ignore and fall back to raw query below
    }

    //
    // Fallback: fetch the hash directly from the table with a raw query.
    //
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

    // No hash on record -> behave like invalid credentials
    if (!hash) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    // Compare supplied password against stored hash
    const ok = await bcrypt.compare(password, hash);
    if (!ok) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    // ✅ PASSWORD IS CORRECT — set your session here (if you have a helper).
    // Example placeholder:
    // await createSession(userId!);
    // return NextResponse.redirect(new URL("/", req.url), { status: 303 });

    return NextResponse.json({ ok: true, userId });
  } catch {
    // Avoid leaking details
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
