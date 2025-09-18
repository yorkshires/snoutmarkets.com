import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Accept GET so you can call it from the browser.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token") ?? "";
    const email = searchParams.get("email") ?? "";
    const password = searchParams.get("password") ?? "";

    const expected = process.env.DEBUG_ADMIN_TOKEN || "monikkedetsnarterfærdigt";
    if (!token || token !== expected) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
    if (!email || !password) {
      return NextResponse.json({ ok: false, error: "missing_email_or_password" }, { status: 400 });
    }

    // Make sure the user exists
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true } });
    if (!user) {
      return NextResponse.json({ ok: false, error: "user_not_found" }, { status: 404 });
    }

    // Find a password column on "public"."User" (case-insensitive)
    const candidates = ["passwordhash", "password_hash", "password"];
    const cols = (await prisma.$queryRaw<
      { column_name: string }[]
    >`SELECT column_name
       FROM information_schema.columns
      WHERE table_schema = 'public'
        AND lower(table_name) = 'user'`) || [];

    const match = cols.find(c => candidates.includes(c.column_name.toLowerCase()));
    if (!match) {
      return NextResponse.json(
        {
          ok: false,
          error: "no_matching_password_column",
          columns_seen: cols.map(c => c.column_name),
        },
        { status: 400 }
      );
    }

    const passwordColumn = match.column_name; // e.g. "passwordHash"
    const hash = await bcrypt.hash(password, 12);

    // Update using raw SQL: parameterise values, inject only the column name
    await prisma.$executeRawUnsafe(
      `UPDATE "public"."User" SET "${passwordColumn}" = $1 WHERE email = $2`,
      hash,
      email
    );

    return NextResponse.json({ ok: true, column: passwordColumn });
  } catch (err) {
    console.error("debug-set-password error:", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
