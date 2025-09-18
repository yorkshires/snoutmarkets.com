import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/session";

export async function POST(req: Request) {
  const res = NextResponse.redirect(new URL("/login", req.url), { status: 303 });
  res.cookies.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return res;
}
