// src/lib/email.ts
import { Resend } from "resend";

const resendKey = process.env.RESEND_API_KEY || "";
// Use a sender that works even if your domain isn't verified yet:
const fromEmail =
  process.env.FROM_EMAIL || "SnoutMarkets <onboarding@resend.dev>";

export async function sendEmail(
  to: string,
  subject: string,
  html: string
) {
  if (!resendKey) {
    // Fail loudly so we see it in Vercel logs
    throw new Error("RESEND_API_KEY is not set");
  }
  const resend = new Resend(resendKey);
  return await resend.emails.send({ from: fromEmail, to, subject, html });
}
