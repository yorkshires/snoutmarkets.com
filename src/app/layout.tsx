// src/app/layout.tsx
import "./globals.css";
import Link from "next/link";
import { cookies } from "next/headers";

export const metadata = {
  title: "SnoutMarkets",
  description: "Buy & sell dogs and gear",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Tjek om der findes en session-cookie
  const jar = cookies();
  // Tilpas evt. disse navne, hvis din cookie hedder noget andet
  const rawSession =
    jar.get("session")?.value ||
    jar.get("sm_session")?.value ||
    jar.get("snout_session")?.value;

  const loggedIn = Boolean(rawSession);

  return (
    <html lang="en">
      <body className="min-h-screen bg-orange-50">
        <header className="border-b bg-white">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="text-xl font-semibold">
              SnoutMarkets
            </Link>

            <div className="flex items-center gap-3">
              <Link href="/sell/new" className="rounded-xl border px-4 py-2">
                Sell
              </Link>

              <Link
                href="/account/listings"
                className="rounded-xl border px-4 py-2"
              >
                My listings
              </Link>

              {loggedIn ? (
                <form action="/logout" method="post">
                  <button
                    type="submit"
                    className="rounded-xl bg-orange-600 text-white px-4 py-2"
                  >
                    Log out
                  </button>
                </form>
              ) : (
                <Link
                  href="/login"
                  className="rounded-xl bg-orange-600 text-white px-4 py-2"
                >
                  Log in
                </Link>
              )}
            </div>
          </div>
        </header>

        <main>{children}</main>

        <footer className="border-t bg-white mt-10">
          <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-end gap-6 text-sm text-gray-600">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
