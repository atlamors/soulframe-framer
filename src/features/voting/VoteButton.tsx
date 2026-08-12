"use client";

import Link from "next/link";
import { useActionState } from "react";
import { togglePublicationVoteAction } from "./actions";

export function VoteButton({
  publicationId,
  initialActive,
  initialCount,
  signedIn,
  signInHref,
}: {
  publicationId: string;
  initialActive: boolean;
  initialCount: number;
  signedIn: boolean;
  signInHref: string;
}) {
  const [state, action, pending] = useActionState(
    togglePublicationVoteAction,
    {
      publicationId,
      active: initialActive,
      count: initialCount,
      error: null,
    },
  );

  if (!signedIn) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-sans text-sm text-ink-soft">{initialCount} upvotes</span>
        <Link
          href={signInHref}
          className="inline-flex min-h-11 items-center border border-gold px-4 font-sans text-sm font-bold uppercase tracking-wide text-gold-bright no-underline"
        >
          Sign in to upvote
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-wrap items-center gap-3">
      <input type="hidden" name="publicationId" value={publicationId} />
      <button
        type="submit"
        aria-pressed={state.active}
        disabled={pending}
        className="inline-flex min-h-11 min-w-28 items-center justify-center border border-gold px-4 font-sans text-sm font-bold uppercase tracking-wide text-gold-bright disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Updating…" : state.active ? "Upvoted" : "Upvote"}
      </button>
      <span aria-live="polite" className="font-sans text-sm text-ink-soft">
        {state.count} upvotes
      </span>
      {state.error ? (
        <span role="alert" className="basis-full font-sans text-sm text-red-200">
          {state.error}
        </span>
      ) : null}
    </form>
  );
}
