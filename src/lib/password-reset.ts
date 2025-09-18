// src/lib/password-reset.ts
import crypto from "crypto";
import { prisma } from "@/lib/db";

function randomHex(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}

export async function createPasswordResetToken(email: string, ttlMinutes = 30) {
  const token = `pr_${randomHex(32)}`;
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

  // Store in MagicLink table (re-using it for reset purpose)
  await prisma.magicLink.create({
    data: { token, email: email.toLowerCase().trim(), expiresAt },
  });

  return { token, expiresAt };
}

// Validate + consume a password reset token
export async function consumePasswordResetToken(token: string) {
  if (!token.startsWith("pr_")) return { ok: false as const, reason: "invalid" };

  const rec = await prisma.magicLink.findUnique({ where: { token } });
  if (!rec) return { ok: false as const, reason: "invalid" };
  if (rec.usedAt) return { ok: false as const, reason: "used" };
  if (rec.expiresAt < new Date()) return { ok: false as const, reason: "expired" };

  await prisma.magicLink.update({
    where: { token },
    data: { usedAt: new Date() },
  });

  return { ok: true as const, email: rec.email };
}
