"use client";

import { useCallback, useRef, useState } from "react";

type Props = {
  onUploaded: (url: string) => void;     // kaldes med den offentlige URL efter upload
  initialUrl?: string | null;            // hvis du vil vise et eksisterende billede
  accept?: string;                       // default: image/*
  maxSizeMB?: number;                    // default: 10
};

export default function ImageUploader({
  onUploaded,
  initialUrl = null,
  accept = "image/*",
  maxSizeMB = 10,
}: Props) {
  const [preview, setPreview] = useState<string | null>(initialUrl ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const doUpload = useCallback(
    async (file: File) => {
      setError(null);
      if (!file) return;

      if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
        setError(`Max file size is ${maxSizeMB} MB`);
        return;
      }
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed");
        return;
      }

      // lokal preview
      setPreview(URL.createObjectURL(file));
      setBusy(true);

      try {
        const fd = new FormData();
        fd.append("file", file);

        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg || `Upload failed (${res.status})`);
        }

        const payload = (await res.json()) as { url: string };
        setPreview(payload.url);
        onUploaded(payload.url);
      } catch (e: any) {
        setError(e?.message || "Upload failed");
        setPreview(initialUrl ?? null);
      } finally {
        setBusy(false);
      }
    },
    [initialUrl, maxSizeMB, onUploaded]
  );

  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0];
    if (f) void doUpload(f);
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) void doUpload(f);
  };

  const openPicker = () => inputRef.current?.click();
  const clear = () => {
    setPreview(null);
    onUploaded("");
  };

  return (
    <div className="space-y-2">
      <div
        className={`rounded-xl border-2 border-dashed p-4 text-center cursor-pointer transition ${
          busy ? "opacity-60" : "hover:bg-gray-50"
        }`}
        onClick={openPicker}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        aria-busy={busy}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={onChange}
          disabled={busy}
        />

        {preview ? (
          <div className="relative mx-auto max-w-sm">
            <img
              src={preview}
              alt="Preview"
              className="w-full rounded-lg object-cover"
            />
            <div className="mt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={openPicker}
                className="rounded-md border px-3 py-1 text-sm"
                disabled={busy}
              >
                Replace
              </button>
              <button
                type="button"
                onClick={clear}
                className="rounded-md border px-3 py-1 text-sm"
                disabled={busy}
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="font-medium">Drag & drop image here</p>
            <p className="text-sm text-gray-500">
              or click to choose a file (max {maxSizeMB} MB)
            </p>
          </div>
        )}
      </div>

      {busy && <p className="text-sm text-gray-500">Uploading…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
