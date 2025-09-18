import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

// Safe, singleton Prisma in dev; fresh in prod
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // log: ["query", "error", "warn"], // enable if you need it
  });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handler(req: Request) {
  try {
    // Accept both GET (query) and POST (JSON)
    let email = "";
    let password = "";
    let token = "";

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

    // If your schema uses `password` instead of `passwordHash`,
    // change the field name below to match your Prisma model.
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
