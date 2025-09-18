// src/lib/passwords.ts
import bcrypt from "bcryptjs";

// Hash new passwords with bcrypt (stable 60-char hashes)
export async function hashPassword(plain: string) {
  const rounds = 12;
  return await bcrypt.hash(plain, rounds);
}

// Verify supports multiple algorithms.
// - bcrypt: $2a$ / $2b$ / $2y$
// - argon2: $argon2i$ / $argon2d$ / $argon2id$
export async function verifyPassword(plain: string, hash: string) {
  if (!plain || !hash) return false;

  // bcrypt family
  if (hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$")) {
    try {
      return await bcrypt.compare(plain, hash);
    } catch {
      return false;
    }
  }

  // argon2 family
  if (hash.startsWith("$argon2")) {
    try {
      // Use dynamic import so deploys work even if argon2 native module
      // isn’t present in older builds. Add it to deps in package.json.
      const argon2 = await import("argon2");
      return await argon2.verify(hash, plain);
    } catch {
      // If argon2 isn't installed or verification fails, treat as mismatch.
      return false;
    }
  }

  // Unknown algorithm
  return false;
}
