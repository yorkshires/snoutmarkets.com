// src/app/layout.tsx
import "./globals.css";
import Link from "next/link";
import { getSessionUserId } from "@/lib/auth";

export const metadata = {
  title: "SnoutMarkets",
  description: "Buy & sell dogs and gear across Europe",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const userId = await getSessionUserId();
  const loggedIn = !!userId;

  return (
    <html lang="en">
      <head>
        {/* Leaflet CSS for the Europe map */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="min-h-screen bg-orange-50 text-slate-900">
        <header className="border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="SnoutMarkets">
              <img src="/publiclogo.png" alt="SnoutMarkets" className="h-8 w-8 rounded-xl" loading="eager" />
              <span className="text-2xl md:text-3xl font-semibold tracking-tight">SnoutMarkets</span>
            </Link>
            <nav className="flex items-center gap-2">
              <Link href="/sell/new" className="rounded-2xl border px-4 py-2">Sell</Link>
              <Link href="/account/listings" className="rounded-2xl border px-4 py-2">My listings</Link>
              {loggedIn ? (
                <form action="/logout" method="post">
                  <button type="submit" className="rounded-2xl bg-orange-600 text-white px-4 py-2">Log out</button>
                </form>
              ) : (
                <Link href="/login" className="rounded-2xl bg-orange-600 text-white px-4 py-2">Log in</Link>
              )}
            </nav>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 md:px-6 py-6">
          {children}
        </main>

        <footer className="border-t bg-white mt-10">
          <div className="max-w-6xl mx-auto px-4 py-8 grid sm:grid-cols-2 items-center">
            <div className="text-sm text-gray-600">
              <div className="font-semibold text-slate-900">SnoutMarkets</div>
              <div>Buy & sell dogs and gear across Europe. Contact sellers directly — no payments through the platform.</div>
            </div>
            <div className="flex justify-end gap-6 text-sm text-gray-600 mt-4 sm:mt-0">
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
