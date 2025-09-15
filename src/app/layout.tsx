// src/app/layout.tsx
import "./globals.css";
import Link from "next/link";
import { cookies } from "next/headers";
// Hvis du har en helper i lib/auth kan vi forsøge at bruge den.
// Den er valgfri – fallback nedenfor kigger direkte i cookies.
import { getSession } from "@/lib/auth";

export const metadata = {
  title: "SnoutMarkets",
  description: "Buy & sell dogs and gear",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Find ud af om brugeren er logget ind
  let userEmail: string | null = null;

  // Prøv først via lib/auth (hvis funktionen findes)
  try {
    const s: any = await (getSession?.() ?? Promise.resolve(null));
    if (s && (s.email || s.user?.email)) {
      userEmail = s.email || s.user?.email;
    }
  } catch {
    /* ignore */
  }

  // Fallback: kig direkte i cookies efter en session-cookie
  if (!userEmail) {
    const jar = cookies();
    // Tilpas navnet hvis din cookie hedder noget andet
    const raw =
      jar.get("session")?.value ||
      jar.get("sm_session")?.value ||
      jar.get("snout_session")?.value;
    if (raw) userEmail = "user";
  }

  const loggedIn = Boolean(userEmail);

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
                // POST til /logout (forudsætter app/logout/route.ts)
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
