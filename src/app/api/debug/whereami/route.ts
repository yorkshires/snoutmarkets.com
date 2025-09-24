import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const total = await prisma.listing.count();
  const active = await prisma.listing.count({ where: { status: "ACTIVE" } });

  const dbInfo = await prisma.$queryRaw<
    Array<{ current_database: string; current_user: string; current_schema: string }>
  >`SELECT current_database(), current_user, current_schema()`;

  const latest = await prisma.listing.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, title: true, status: true, createdAt: true },
  });

  return NextResponse.json({ db: dbInfo[0], counts: { total, active }, latest });
}
