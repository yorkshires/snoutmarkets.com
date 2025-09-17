// src/app/api/login/password/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/auth";

function withParams(req: NextRequest, params: Record<string, string>) {
  const url = new URL("/login", req.url);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return url;
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const email = String(form.get("email") || "").toLowerCase().trim();
    const password = String(form.get("password") || "");

    if (!email || !password) {
      return NextResponse.redirect(
        withParams(req, { error: "invalid", email }),
        { status: 303 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return NextResponse.redirect(
        withParams(req, { error: "badcreds", email }),
        { status: 303 }
      );
    }

    if (!(user as any)?.emailVerifiedAt) {
      return NextResponse.redirect(
        withParams(req, { error: "verify", email }),
        { status: 303 }
      );
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.redirect(
        withParams(req, { error: "badcreds", email }),
        { status: 303 }
      );
    }

    await createSession(user.id);
    return NextResponse.redirect(new URL("/", req.url), { status: 303 });
  } catch (err) {
    console.error("password login error", err);
    return NextResponse.redirect(
      withParams(req, { error: "server" }),
      { status: 303 }
    );
  }
}
