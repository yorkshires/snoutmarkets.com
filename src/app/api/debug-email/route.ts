// src/app/api/debug-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/mailer";

export async function GET(req: NextRequest) {
  const to = new URL(req.url).searchParams.get("to");
  if (!to) return NextResponse.json({ ok: false, error: "to required" }, { status: 400 });

  try {
    const data = await sendEmail({
      to,
      subject: "SnoutMarkets test email",
      html: "<p>If you received this, Resend works.</p>",
    });
    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}
