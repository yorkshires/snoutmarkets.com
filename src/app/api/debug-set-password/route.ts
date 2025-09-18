import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

// Local Prisma (do NOT export from a route file)
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
let prisma: PrismaClient;
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  prisma = globalForPrisma.prisma ?? new PrismaClient();
  globalForPrisma.prisma = prisma;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Utilities
function bad(status: number, msg: string) {
  return NextResponse.json({ ok: false, error: msg }, { status });
}

// Try a few realistic table/column combos (Postgres)
async function upsertPasswordRaw(
  email: string,
  hashed: string
): Promise<{ ok: boolean; used?: { table: string; column: string } }> {
  // candidates: [table, column]
  const candidates: Array<[string, string]> = [
    [`"User"`, `"passwordHash"`], // Prisma default model User with passwordHash
    [`"User"`, `"password"`],     // model User with "password"
    [`"users"`, `"passwordHash"`],// snake plural
    [`"users"`, `"password"`],
    [`users`, `passwordHash`],
    [`users`, `password`],
  ];

  for (const [table, column] of candidates) {
    const sql =
      `INSERT INTO ${table} ("email", ${column}) ` +
      `VALUES ($1, $2) ` +
      `ON CONFLICT ("email") DO UPDATE SET ${column} = EXCLUDED.${column}`;

    try {
      await prisma.$executeRawUnsafe(sql, email, hashed);
      return { ok: true, used: { table, column } };
    } catch (e) {
      // Try the next candidate
      continue;
    }
  }

  return { ok: false };
}

async function handler(req: Request) {
  try {
    // Accept GET (query) and POST (JSON)
    let token = "";
    let email = "";
    let password = "";

    if (req.method === "POST") {
      const body = (await req.json().catch(() => ({}))) as any;
      token = String(body.token ?? "");
      email = String(body.email ?? "").trim().toLowerCase();
      password = String(body.password ?? "");
    } else {
      const sp = new URL(req.url).searchParams;
      token = sp.get("token") ?? "";
      email = (sp.get("email") ?? "").trim().toLowerCase();
      password = sp.get("password") ?? "";
    }

    const expected = process.env.DEBUG_ADMIN_TOKEN || "monikkedetsnarterfærdigt";
    if (!token || token !== expected) {
      return bad(401, "unauthorized");
    }
    if (!email || !password) {
      return bad(400, "missing email or password");
    }

    const hashed = await bcrypt.hash(password, 10);

    // First try pure SQL upsert with common table/column names
    const r = await upsertPasswordRaw(email, hashed);
    if (r.ok) {
      return NextResponse.json({ ok: true, method: "raw", used: r.used });
    }

    // If all raw patterns failed, give a clearer error
    console.error(
      "debug-set-password: could not find a matching table/column for password. " +
        "Please align the route with your Prisma schema."
    );
    return bad(500, "no_matching_password_column");
  } catch (err) {
    console.error("debug-set-password error:", err);
    return bad(500, "server_error");
  }
}

export { handler as GET, handler as POST };
