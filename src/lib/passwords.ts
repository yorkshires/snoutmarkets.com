// src/lib/passwords.ts
import bcrypt from "bcryptjs";

export async function hashPassword(plain: string) {
  const rounds = 12;
  return await bcrypt.hash(plain, rounds);
}

export async function verifyPassword(plain: string, hash: string) {
  if (!plain || !hash) return false;
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}
