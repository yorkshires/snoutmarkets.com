// src/app/api/upload/route.ts
export const runtime = "edge";

import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    // Gem i en mappe pr. type – og gør offentlig tilgængelig
    const blob = await put(`listings/${Date.now()}-${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
    });

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
      size: blob.size,
      contentType: blob.contentType,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function GET() {
  return new Response("Method not allowed", {
    status: 405,
    headers: { Allow: "POST" },
  });
}
