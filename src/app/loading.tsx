// src/app/loading.tsx
export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-white/60 backdrop-blur-sm">
      <div
        className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-transparent"
        aria-label="Loading page"
        role="status"
      />
    </div>
  );
}
