// src/lib/auth/password.ts
import bcrypt from "bcryptjs";

/**
 * Hash a plaintext password using bcryptjs.
 * A cost of 10 is a good balance for serverless runtimes.
 */
export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
}

/**
 * Constant-time verify. Returns false if the stored hash is null/undefined.
 */
export async function verifyPassword(
  plain: string,
  hash: string | null | undefined
) {
  if (!hash) return false;
  return bcrypt.compare(plain, hash);
}
