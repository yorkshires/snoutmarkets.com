// src/app/layout.tsx
import "./globals.css";
import Link from "next/link";
import { getSessionUserId } from "@/lib/auth";
import AuthButtons from "@/components/AuthButtons";

// ensure no stale caching for the header
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
  // Server-side read (fast, correct on first load)
  const userId = await getSessionUserId();
  const loggedIn = Boolean(userId);

  return (
    <html lang="en">
      <body className="min-h-screen bg-orange-50">
        <header className="border-b bg-white">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            {/* use a normal anchor to force a full document load if needed */}
            <a href="/" aria-label="SnoutMarkets" className="text-xl font-semibold">
              SnoutMarkets
            </a>

            <div className="flex items-center gap-3">
              <Link href="/sell/new" className="rounded-xl border px-4 py-2">
                Sell
              </Link>

              <Link href="/account/listings" className="rounded-xl border px-4 py-2">
                My listings
              </Link>

              {/* Client component confirms cookie after hydration */}
              <AuthButtons initialLoggedIn={loggedIn} />
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
