// src/app/api/auth/logout/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/", req.url));
  clearSession(res);
  return res;
}
