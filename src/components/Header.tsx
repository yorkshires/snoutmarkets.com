// src/components/Header.tsx
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Header() {
  const user = await getSessionUser();

  return (
    <header className="flex items-center justify-between px-4 py-3">
      <Link href="/" className="text-xl font-semibold">
        SnoutMarkets
      </Link>

      <nav className="flex items-center gap-3">
        <Link href="/sell" className="px-3 py-1 rounded border">
          Sell
        </Link>
        <Link href="/account/listings" className="px-3 py-1 rounded border">
          My listings
        </Link>

        {user ? (
          <form action="/api/logout" method="post">
            <span className="mr-2 text-sm text-gray-600">{user.email}</span>
            <button
              type="submit"
              className="px-3 py-1 rounded bg-orange-600 text-white"
            >
              Log out
            </button>
          </form>
        ) : (
          <Link href="/login" className="px-3 py-1 rounded bg-orange-600 text-white">
            Log in
          </Link>
        )}
      </nav>
    </header>
  );
}
