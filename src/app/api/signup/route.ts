// src/app/api/signup/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { hashPassword } from "@/lib/password";

// Node runtime (crypto support)
export const runtime = "nodejs";

const prisma = new PrismaClient();

const FormSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(6).max(100),
});

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const email = String(form.get("email") || "").trim().toLowerCase();
    const password = String(form.get("password") || "");

    const parsed = FormSchema.safeParse({ email, password });
    if (!parsed.success) {
      return NextResponse.redirect(new URL("/login?error=invalid", req.url), { status: 303 });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.redirect(new URL("/login?error=exists", req.url), { status: 303 });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, passwordHash },
      select: { id: true, email: true },
    });

    // Best-effort: create a minimal seller profile if table exists
    try {
      // @ts-ignore (optional relation depending on your schema)
      await prisma.sellerProfile.create({
        data: { userId: user.id, displayName: email.split("@")[0] },
      });
    } catch {
      /* ignore if SellerProfile not present */
    }

    // Success → back to login
    return NextResponse.redirect(new URL("/login?created=1", req.url), { status: 303 });
  } catch (e) {
    console.error("signup error", e);
    return NextResponse.redirect(new URL("/login?error=signup", req.url), { status: 303 });
  }
}
