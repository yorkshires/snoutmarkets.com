// src/app/api/login/password/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/auth";

function redirectWith(req: NextRequest, params: Record<string, string>) {
  const url = new URL("/login", req.url);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(req: NextRequest) {
  let stage = "start";

  try {
    stage = "read-form";
    const form = await req.formData();
    const email = String(form.get("email") || "").toLowerCase().trim();
    const password = String(form.get("password") || "");

    if (!email || !password) {
      return redirectWith(req, { error: "invalid", email, stage });
    }

    // --- find-user (robust) ---
    // Use findFirst instead of findUnique to avoid runtime errors on some deployments
    // (e.g. missing unique index in DB, driver quirks with PgBouncer, etc.)
    stage = "find-user";
    const user = await prisma.user.findFirst({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        // we only read what we need to proceed
        // (emailVerifiedAt may not exist on some older clients; if it's missing,
        //  the expression below will treat it as not verified)
        // @ts-ignore - tolerate projects without this column at runtime
        emailVerifiedAt: true,
      },
    });

    if (!user || !user.passwordHash) {
      return redirectWith(req, { error: "badcreds", email, stage });
    }

    // Gate on verification if the column exists and is null
    // @ts-ignore
    if (typeof user.emailVerifiedAt !== "undefined" && !user.emailVerifiedAt) {
      return redirectWith(req, { error: "verify", email, stage: "check-verified" });
    }

    stage = "verify-password";
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return redirectWith(req, { error: "badcreds", email, stage });
    }

    stage = "create-session";
    await createSession(user.id);

    return NextResponse.redirect(new URL("/", req.url), { status: 303 });
  } catch (err) {
    // keep the stage marker so we can see exactly where it exploded
    console.error("password login error, stage =", stage, err);
    return redirectWith(req, { error: "server", stage });
  }
}
