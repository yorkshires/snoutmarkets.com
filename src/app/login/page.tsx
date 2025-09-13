// src/app/login/page.tsx
export default function LoginPage() {
  return (
    <main className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-4">Log in</h1>
      <p className="text-gray-600 mb-6">
        We’ll email you a one-time login link.
      </p>

      <form
        action="/api/auth/magic-link"
        method="post"
        className="rounded-xl border p-4 space-y-3"
      >
        <label className="block text-sm font-medium">Email</label>
        <input
          className="w-full rounded-md border px-3 py-2"
          name="email"
          type="email"
          required
        />
        <button
          type="submit"
          className="rounded-xl bg-orange-600 text-white px-4 py-2"
        >
          Send login link
        </button>
      </form>
    </main>
  );
}
