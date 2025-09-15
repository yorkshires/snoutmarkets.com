// src/app/layout.tsx
import "./globals.css";
import Link from "next/link";
import { getSessionUserId } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "default-no-store";

export const metadata = {
  title: "SnoutMarkets",
  description: "Buy & sell dogs and gear",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getSessionUserId();
  const loggedIn = Boolean(userId);

  return (
    <html lang="en">
      <body className="min-h-screen bg-orange-50">
        <header className="border-b bg-white/95 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            {/* Logo + brand (file at /public/publiclogo.png -> URL /publiclogo.png) */}
            <a href="/" className="flex items-center gap-2" aria-label="SnoutMarkets">
              <img
                src="/publiclogo.png"
                alt="SnoutMarkets logo"
                className="h-8 w-8 rounded-xl"
                loading="eager"
              />
              <span className="text-2xl md:text-3xl font-semibold tracking-tight">
                SnoutMarkets
              </span>
            </a>

            <nav className="flex items-center gap-3">
              <Link href="/sell/new" className="rounded-xl border px-4 py-2">
                Sell
              </Link>
              <Link href="/account/listings" className="rounded-xl border px-4 py-2">
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
                <Link href="/login" className="rounded-xl bg-orange-600 text-white px-4 py-2">
                  Log in
                </Link>
              )}
            </nav>
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
