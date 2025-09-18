// src/lib/passwords.ts
import bcrypt from "bcryptjs";
import { scrypt as _scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scrypt = promisify(_scrypt);

// Hash new passwords with bcrypt (stable 60-char hashes)
export async function hashPassword(plain: string) {
  const rounds = 12;
  return await bcrypt.hash(plain, rounds);
}

// Verify supports multiple algorithms.
// - bcrypt: $2a$ / $2b$ / $2y$
// - argon2: $argon2i$ / $argon2d$ / $argon2id$
// - legacy scrypt: s2:<hex salt>:<hex hash>
export async function verifyPassword(plain: string, hash: string) {
  if (!plain || !hash) return false;

  // Legacy scrypt ("s2:<salt>:<hex>") support
  if (hash.startsWith("s2:")) {
    const parts = hash.split(":");
    if (parts.length !== 3) return false;
    const [, salt, hex] = parts;
    if (!salt || !hex) return false;

    const expected = Buffer.from(hex, "hex");
    const got = (await scrypt(plain, salt, expected.length)) as Buffer;
    return got.length === expected.length && timingSafeEqual(got, expected);
  }

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
      // dynamic import so deploys don't require native module present at build time
      const argon2 = await import("argon2");
      return await argon2.verify(hash, plain);
    } catch {
      return false;
    }
  }

  // Unknown algorithm
  return false;
}
