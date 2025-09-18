// src/components/Header.tsx
import Link from "next/link";
import { getSessionUserId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Header() {
  const uid = await getSessionUserId();
  const loggedIn = !!uid;

  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
      <Link href="/" className="text-2xl font-semibold">SnoutMarkets</Link>

      <nav className="flex items-center gap-3">
        <Link href="/sell" className="rounded-full border px-4 py-2">Sell</Link>
        <Link href="/my-listings" className="rounded-full border px-4 py-2">My listings</Link>

        {!loggedIn ? (
          <Link href="/login" className="rounded-full bg-orange-500 px-4 py-2 text-white">
            Log in
          </Link>
        ) : (
          <form action="/api/auth/logout" method="POST">
            <button className="rounded-full bg-gray-900 px-4 py-2 text-white">
              Log out
            </button>
          </form>
        )}
      </nav>
    </header>
  );
}
