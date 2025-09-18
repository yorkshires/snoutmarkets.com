// src/lib/verify.ts
import { SignJWT, jwtVerify } from "jose";

function secret() {
  const key =
    process.env.SESSION_SECRET ||
    process.env.JWT_SECRET ||
    process.env.AUTH_SECRET;
  if (!key) throw new Error("SESSION/JWT/AUTH secret missing");
  return new TextEncoder().encode(key);
}

export async function makeVerifyToken(email: string) {
  return await new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30m") // 30 minutes
    .sign(secret());
}

export async function readVerifyToken(token: string) {
  const { payload } = await jwtVerify(token, secret());
  const email = String(payload.email || "");
  if (!email) throw new Error("Invalid token");
  return email.toLowerCase();
}
