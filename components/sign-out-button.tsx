"use client";

import { signOut } from "next-auth/react";

export function SignOutButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-black/15 bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-lemon-chiffon"
    >
      {children}
    </button>
  );
}
