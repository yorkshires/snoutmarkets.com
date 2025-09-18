// src/app/api/auth/verify/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { readVerifyToken } from "@/lib/verify";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") || "";
  try {
    const email = await readVerifyToken(token);
    await prisma.user.update({
      where: { email },
      data: { emailVerified: true },
    });
    return NextResponse.redirect(new URL("/login?info=verified", req.url));
  } catch (e: any) {
    const msg = encodeURIComponent(String(e?.message || "invalid-token"));
    return NextResponse.redirect(new URL(`/login?error=${msg}`, req.url));
  }
}
