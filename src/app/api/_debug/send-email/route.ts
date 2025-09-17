// src/app/api/_debug/send-email/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  try {
    const to =
      req.nextUrl.searchParams.get("to") || "billing@yorkshires.eu";
    await sendEmail(
      to,
      "SnoutMarkets test email",
      "<p>This is a test email from /api/_debug/send-email</p>"
    );
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("debug send email error:", e?.message || e);
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}
