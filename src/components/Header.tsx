// src/components/Header.tsx
import Link from "next/link";
import Image from "next/image";
import { getSessionUserId } from "@/lib/auth";

export default async function Header() {
  const userId = await getSessionUserId();
  const isAuthed = !!userId;

  return (
    <header className="w-full bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/publiclogo.png"
            alt="SnoutMarkets"
            width={28}
            height={28}
            className="rounded-lg"
            priority
          />
          <span className="text-2xl font-semibold tracking-tight text-slate-900">
            SnoutMarkets
          </span>
        </Link>

        <nav className="flex items-center gap-3">
          <Link href="/account/listings" className="text-sm text-slate-700 hover:underline">
            My listings
          </Link>
          {isAuthed ? (
            <form action="/logout" method="post">
              <button
                type="submit"
                className="rounded-xl bg-orange-600 text-white px-4 py-2 text-sm"
              >
                Log out
              </button>
            </form>
          ) : (
            <Link href="/login" className="rounded-xl bg-orange-600 text-white px-4 py-2 text-sm">
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
