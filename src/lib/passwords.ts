// src/lib/password.ts
import { randomBytes, scrypt as _scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scrypt = promisify(_scrypt);

/**
 * Hash a password with scrypt.
 * Stored format: "s2:<hex salt>:<hex hash>"
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scrypt(password, salt, 64)) as Buffer;
  return `s2:${salt}:${buf.toString("hex")}`;
}

/**
 * Verify a plaintext password against a stored scrypt hash.
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, salt, hex] = String(stored).split(":");
  if (scheme !== "s2" || !salt || !hex) return false;
  const expected = Buffer.from(hex, "hex");
  const got = (await scrypt(password, salt, 64)) as Buffer;
  return got.length === expected.length && timingSafeEqual(got, expected);
}
