// src/lib/password-reset.ts
import crypto from "crypto";
import { prisma } from "@/lib/db";

export function generateRawToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex"); // send this by email
}

export function sha256(input: string) {
  return crypto.createHash("sha256").update(input, "utf8").digest("hex");
}

// Create a reset record; returns the raw token to email
export async function createPasswordReset(userId: string, ttlMinutes = 30) {
  const raw = generateRawToken();
  const tokenHash = sha256(raw);
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

  // Invalidate old pending tokens
  await prisma.passwordReset.updateMany({
    where: { userId, usedAt: null, expiresAt: { gt: new Date() } },
    data: { expiresAt: new Date() },
  });

  await prisma.passwordReset.create({
    data: { userId, tokenHash, expiresAt },
  });

  return { raw, expiresAt };
}

export async function consumePasswordReset(rawToken: string) {
  const tokenHash = sha256(rawToken);

  const pr = await prisma.passwordReset.findUnique({ where: { tokenHash } });
  if (!pr) return { ok: false as const, reason: "invalid" };
  if (pr.usedAt) return { ok: false as const, reason: "used" };
  if (pr.expiresAt < new Date()) return { ok: false as const, reason: "expired" };

  // mark used
  await prisma.passwordReset.update({
    where: { tokenHash },
    data: { usedAt: new Date() },
  });

  return { ok: true as const, userId: pr.userId };
}
