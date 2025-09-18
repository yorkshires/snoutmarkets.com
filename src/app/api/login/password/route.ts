// src/app/api/login/password/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db"; // adjust if your prisma helper has a different path
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

    // Only select what's needed for password auth
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, passwordHash: true },
    });

    // Always return the same error on “not found” or “no password set”
    if (!user?.passwordHash) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    // ✅ PASSWORD IS CORRECT — set your session here.
    // If you already have a helper, keep using it (e.g. createSession(user.id))
    // and then redirect or return JSON. Example placeholder:
    //
    // await createSession(user.id); // <--- keep your existing session code
    // return NextResponse.redirect(new URL("/", req.url), { status: 303 });
    //
    // If you prefer JSON success:
    return NextResponse.json({ ok: true });
  } catch (err) {
    // Avoid leaking details
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
