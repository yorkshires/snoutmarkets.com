// src/app/api/debug-session/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const uid = await getSessionUserId();
  return NextResponse.json({ ok: true, uid });
}
