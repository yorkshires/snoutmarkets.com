// src/lib/auth.ts
import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession } from "@/lib/session";
import { prisma } from "@/lib/db";

/**
 * Returns `{ id, email }` of the logged-in user or `null`.
 * Safe to call in Server Components and Route Handlers.
 */
export async function getSessionUser() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { uid } = await verifySession(token);
    const user = await prisma.user.findUnique({
      where: { id: uid },
      select: { id: true, email: true },
    });
    return user; // null if not found
  } catch {
    return null;
  }
}
