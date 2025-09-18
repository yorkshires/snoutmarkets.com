import { NextResponse } from "next/server";
import { consumePasswordReset } from "@/lib/password-reset";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/passwords";

export async function POST(req: Request) {
  const { token, newPassword } = await req.json().catch(() => ({}));

  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }
  if (!newPassword || typeof newPassword !== "string" || newPassword.length < 8) {
    return NextResponse.json({ error: "Password too short" }, { status: 400 });
  }

  const res = await consumePasswordReset(token);
  if (!res.ok) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: res.userId },
    data: { password: passwordHash },
  });

  return NextResponse.json({ ok: true });
}
