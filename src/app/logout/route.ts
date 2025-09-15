// src/app/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";

async function doLogout(req: NextRequest) {
  clearSession();
  return NextResponse.redirect(new URL("/", req.url));
}

export async function GET(req: NextRequest) {
  return doLogout(req);
}

export async function POST(req: NextRequest) {
  return doLogout(req);
}
