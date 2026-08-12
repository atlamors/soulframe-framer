"use client";

import Link from "next/link";
import { LogOut, UserRound } from "lucide-react";
import { useEffect, useRef, type KeyboardEvent } from "react";
import type { AuthSession } from "../../server/contracts/auth";
import { signOutAction } from "./actions";

export function AccountControl({
  session,
  nextPath,
  buttonClassName,
  iconClassName,
}: {
  session: AuthSession | null;
  nextPath: string;
  buttonClassName: string;
  iconClassName: string;
}) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const summaryRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const closeOnOutsidePointer = (event: PointerEvent) => {
      const details = detailsRef.current;
      if (details?.open && !details.contains(event.target as Node)) {
        details.open = false;
      }
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer, true);
    return () =>
      document.removeEventListener("pointerdown", closeOnOutsidePointer, true);
  }, []);

  if (!session) {
    const signInHref = `/auth/sign-in?${new URLSearchParams({ next: nextPath })}`;
    return (
      <Link
        href={signInHref}
        className={buttonClassName}
        aria-label="Sign in"
        title="Sign in"
      >
        <UserRound className={iconClassName} aria-hidden="true" />
      </Link>
    );
  }

  const accountLabel =
    session.account.displayName ?? session.account.email ?? "Nightfold account";
  const handleDetailsKeyDown = (event: KeyboardEvent<HTMLDetailsElement>) => {
    if (event.key !== "Escape" || !detailsRef.current?.open) return;
    event.preventDefault();
    event.stopPropagation();
    detailsRef.current.open = false;
    summaryRef.current?.focus();
  };

  return (
    <details
      ref={detailsRef}
      className="group relative"
      onKeyDown={handleDetailsKeyDown}
    >
      <summary
        ref={summaryRef}
        className={`${buttonClassName} list-none [&::-webkit-details-marker]:hidden`}
        aria-label={`Account: ${accountLabel}`}
        title={accountLabel}
      >
        <UserRound className={iconClassName} aria-hidden="true" />
      </summary>
      <div className="absolute top-[calc(100%+0.5rem)] right-0 z-90 w-64 border border-line-bright/60 bg-surface-raised p-3 text-left shadow-overlay">
        <p className="truncate font-sans text-sm font-bold text-ink">
          {accountLabel}
        </p>
        {session.account.email && session.account.email !== accountLabel ? (
          <p className="mt-0.5 truncate font-sans text-xs text-ink-faint">
            {session.account.email}
          </p>
        ) : null}
        <div className="mt-3 grid border-t border-line/60 pt-2">
          <Link
            href="/soulframe/profile"
            className="flex min-h-11 items-center px-2 font-sans text-xs font-bold uppercase tracking-wide text-gold no-underline hover:bg-surface-overlay hover:text-gold-bright focus-visible:outline-none focus-visible:shadow-focus"
          >
            Creator Profile
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex min-h-11 w-full cursor-pointer items-center gap-2 border-0 bg-transparent px-2 font-sans text-xs font-bold uppercase tracking-wide text-ink-soft hover:bg-surface-overlay hover:text-gold-bright focus-visible:outline-none focus-visible:shadow-focus"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Sign out
            </button>
          </form>
        </div>
      </div>
    </details>
  );
}
