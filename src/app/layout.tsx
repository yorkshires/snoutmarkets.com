// src/app/layout.tsx
import "./globals.css";
import Link from "next/link";
import { getSessionUserId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "SnoutMarkets",
  description: "Buy & sell dogs and gear",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side check so the header reflects the real cookie/session
  const userId = await getSessionUserId();
  const loggedIn = Boolean(userId);

  return (
    <html lang="en">
      <body className="min-h-screen bg-orange-50">
        <header className="border-b bg-white">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            {/* Use a normal anchor to force a full page reload */}
            <a href="/" aria-label="SnoutMarkets" className="text-xl font-semibold">
              SnoutMarkets
            </a>

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
