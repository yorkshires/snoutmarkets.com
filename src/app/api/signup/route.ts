// src/app/api/signup/route.ts
// Create-account endpoint for form POSTs
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { hashPassword } from "@/lib/password";

// Force Node.js runtime (Edge has no Node crypto)
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

    // Best-effort: create a minimal SellerProfile if the model exists
    // (ignore if not present in this DB yet)
    await prisma.$executeRawUnsafe?.(
      "" // no-op, ensures try/catch path compiles even if you remove this block later
    );
    try {
      // @ts-ignore — optional; depends on your schema
      await prisma.sellerProfile.create({
        data: { userId: user.id, displayName: email.split("@")[0] },
      });
    } catch {
      // harmless if SellerProfile table doesn't exist yet
    }

    // Redirect back to login with success notice (you can auto-login here if desired)
    return NextResponse.redirect(new URL("/login?created=1", req.url), { status: 303 });
  } catch (err) {
    console.error("signup error", err);
    return NextResponse.redirect(new URL("/login?error=signup", req.url), { status: 303 });
  }
}
