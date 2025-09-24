import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const count = await prisma.listing.count();
  const latest = await prisma.listing.findMany({
    orderBy: { createdAt: "desc" },
    take: 3,
    select: { id: true, title: true, createdAt: true, status: true },
  });
  return NextResponse.json({ count, latest });
}
