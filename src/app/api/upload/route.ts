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

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "Missing BLOB_READ_WRITE_TOKEN" },
        { status: 500 }
      );
    }

    // simple guards (valgfrit)
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files allowed" }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Max 10MB" }, { status: 400 });
    }

    const safeName = file.name.replace(/[^\w.\-]/g, "_");

    const blob = await put(`listings/${Date.now()}-${safeName}`, file, {
      access: "public",
      token,
    });

    // nogle versioner har ikke blob.pathname i typen – afled den sikkert fra URL:
    const pathname =
      (blob as any).pathname ?? new URL(blob.url).pathname;

    return NextResponse.json(
      {
        url: blob.url,
        pathname,
        // tag metadata fra File – ikke fra blob-typen:
        size: file.size,
        contentType: file.type,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Upload failed" },
      { status: 500 }
    );
  }
}
