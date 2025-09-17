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
  let stage = "start";
  const redirect = (params: Record<string, string>) =>
    NextResponse.redirect(withParams(req, params), { status: 303 });

  try {
    stage = "read-form";
    const form = await req.formData();
    const email = String(form.get("email") || "").toLowerCase().trim();
    const password = String(form.get("password") || "");

    if (!email || !password) {
      return redirect({ error: "invalid", email, stage });
    }

    stage = "find-user";
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return redirect({ error: "badcreds", email, stage });
    }

    stage = "check-verified";
    if (!(user as any).emailVerifiedAt) {
      return redirect({ error: "verify", email, stage });
    }

    stage = "verify-password";
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return redirect({ error: "badcreds", email, stage });
    }

    stage = "create-session";
    await createSession(user.id);

    stage = "done";
    return NextResponse.redirect(new URL("/", req.url), { status: 303 });
  } catch (err) {
    console.error("password login error, stage =", stage, err);
    return redirect({ error: "server", stage });
  }
}
