"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Optional: log for debugging
  // console.error(error);

  return (
    <div className="max-w-lg mx-auto mt-20 rounded-2xl border bg-white shadow-sm p-6 text-center">
      <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
      <p className="text-slate-600 mb-4">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={() => reset()}
        className="rounded-xl bg-orange-600 text-white px-4 py-2"
      >
        Try again
      </button>
    </div>
  );
}
