"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

function hasUidCookie() {
  // checks for a non-empty sm_uid cookie
  return document.cookie.split("; ").some((c) => {
    if (!c.startsWith("sm_uid=")) return false;
    const v = c.substring("sm_uid=".length + c.indexOf("sm_uid="));
    return v && v !== "''" && v !== '""';
  });
}

export default function AuthButtons({ initialLoggedIn }: { initialLoggedIn: boolean }) {
  const [loggedIn, setLoggedIn] = useState(initialLoggedIn);

  // Client confirmation in case of cached SSR or client-side transitions
  useEffect(() => {
    setLoggedIn(hasUidCookie());
  }, []);

  return loggedIn ? (
    <form action="/logout" method="post">
      <button type="submit" className="rounded-xl bg-orange-600 text-white px-4 py-2">
        Log out
      </button>
    </form>
  ) : (
    <Link href="/login" className="rounded-xl bg-orange-600 text-white px-4 py-2">
      Log in
    </Link>
  );
}
