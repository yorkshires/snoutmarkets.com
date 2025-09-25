// src/components/BindImageUploader.tsx
"use client";

import ImageUploader from "@/components/ImageUploader";

type Props = {
  /** The id of the hidden input that should receive the uploaded URL */
  inputId: string;
  /** Existing image URL to preview initially (if any) */
  initialUrl?: string | null;
};

export default function BindImageUploader({ inputId, initialUrl = null }: Props) {
  return (
    <ImageUploader
      initialUrl={initialUrl ?? null}
      onUploaded={(url: string) => {
        const input = document.getElementById(inputId) as HTMLInputElement | null;
        if (input) input.value = url;
      }}
    />
  );
}
