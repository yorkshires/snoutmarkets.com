// src/app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";

export async function GET() {
  const uid = await getSessionUserId();
  return NextResponse.json({ loggedIn: !!uid, uid: uid ?? null });
}
