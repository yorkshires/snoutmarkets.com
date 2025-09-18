// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";
import { jwtVerify } from "jose";

function getKey() {
  const raw =
    process.env.SESSION_SECRET ||
    process.env.JWT_SECRET ||
    process.env.AUTH_SECRET;
  if (!raw) throw new Error("SESSION_SECRET/JWT_SECRET/AUTH_SECRET is missing");
  return new TextEncoder().encode(raw);
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return NextResponse.redirect(new URL("/login", req.url));

  try {
    await jwtVerify(token, getKey());
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/sell/:path*", "/account/:path*"], // protect these routes
};
