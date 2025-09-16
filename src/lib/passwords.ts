// src/lib/passwords.ts
import { randomBytes, scrypt as _scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
const scrypt = promisify(_scrypt);

const ALG = "scrypt";
const KEYLEN = 64;

export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = (await scrypt(plain, salt, KEYLEN)) as Buffer;
  return `${ALG}:${salt.toString("hex")}:${derived.toString("hex")}`;
}

export async function verifyPassword(plain: string, stored?: string | null): Promise<boolean> {
  if (!stored) return false;
  const [alg, saltHex, hashHex] = stored.split(":");
  if (alg !== ALG || !saltHex || !hashHex) return false;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const got = (await scrypt(plain, salt, expected.length)) as Buffer;
  // Use constant-time compare
  return got.length === expected.length && timingSafeEqual(got, expected);
}
