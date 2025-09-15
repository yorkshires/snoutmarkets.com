// src/components/Header.tsx
import Link from "next/link";
import { getSessionUserId } from "@/lib/auth";

// Server component: reads cookies via getSessionUserId(), so header reflects auth state
export default async function Header() {
  const userId = await getSessionUserId();
  const isAuthed = !!userId;

  return (
    <header className="w-full bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-2xl font-semibold">
          SnoutMarkets
        </Link>

        <nav className="flex items-center gap-3">
          <Link href="/sell" className="btn">
            Sell
          </Link>
          <Link href="/account/listings" className="btn">
            My listings
          </Link>

          {isAuthed ? (
            <form action="/logout" method="post">
              <button type="submit" className="btn btn-primary">
                Log out
              </button>
            </form>
          ) : (
            <Link href="/login" className="btn btn-primary">
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
