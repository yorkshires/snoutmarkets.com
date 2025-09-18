import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";        // ensure Node runtime
export const dynamic = "force-dynamic"; // no caching

async function handler(req: Request) {
  try {
    // Accept both GET (query params) and POST (JSON body)
    let email = "";
    let password = "";
    let token = "";

    if (req.method === "POST") {
      const body = await req.json().catch(() => ({} as any));
      token = body.token || "";
      email = (body.email || "").trim().toLowerCase();
      password = body.password || "";
    } else {
      const { searchParams } = new URL(req.url);
      token = searchParams.get("token") || "";
      email = (searchParams.get("email") || "").trim().toLowerCase();
      password = searchParams.get("password") || "";
    }

    const expected = process.env.DEBUG_ADMIN_TOKEN || "monikkedetsnarterfærdigt";
    if (!token || token !== expected) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
    if (!email || !password) {
      return NextResponse.json({ ok: false, error: "missing email or password" }, { status: 400 });
    }

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
