import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

// --- Prisma client (no exports here) ---
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

let prisma: PrismaClient;
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  prisma = globalForPrisma.prisma ?? new PrismaClient();
  globalForPrisma.prisma = prisma;
}

// Route config
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Handles both GET (query string) and POST (JSON)
async function handler(req: Request) {
  try {
    let token = "";
    let email = "";
    let password = "";

    if (req.method === "POST") {
      const body = await req.json().catch(() => ({} as any));
      token = (body.token ?? "").toString();
      email = (body.email ?? "").toString().trim().toLowerCase();
      password = (body.password ?? "").toString();
    } else {
      const sp = new URL(req.url).searchParams;
      token = sp.get("token") ?? "";
      email = (sp.get("email") ?? "").trim().toLowerCase();
      password = sp.get("password") ?? "";
    }

    const expected = process.env.DEBUG_ADMIN_TOKEN || "monikkedetsnarterfærdigt";
    if (!token || token !== expected) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
    if (!email || !password) {
      return NextResponse.json({ ok: false, error: "missing email or password" }, { status: 400 });
    }

    // If your Prisma model uses `password` instead of `passwordHash`,
    // change these two fields below to match your schema.
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
      where: { email },
      update: { passwordHash },
      create: { email, passwordHash },
      select: { id: true, email: true },
    });

    return NextResponse.json({ ok: true, user });
  } catch (err) {
    console.error("debug-set-password error", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

export { handler as GET, handler as POST };
