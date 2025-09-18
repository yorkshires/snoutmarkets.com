// src/lib/mailer.ts
import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL =
  process.env.FROM_EMAIL || "SnoutMarkets <onboarding@resend.dev>";

let resend: Resend | null = null;

function client() {
  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is missing");
  }
  if (!resend) resend = new Resend(RESEND_API_KEY);
  return resend!;
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}) {
  const { data, error } = await client().emails.send({
    from: FROM_EMAIL,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });

  if (error) {
    // Show the real reason (e.g. domain not verified, invalid from, etc.)
    throw new Error(`Resend error: ${error.message}`);
  }
  return data;
}
