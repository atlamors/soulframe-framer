import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  signInWithDiscordAction,
  signInWithTwitchAction,
} from "../../../src/features/auth/actions";
import { getBackendForRequest } from "../../../src/server/composition/backend";
import { PageWidth } from "@/src/ui/layout";

export const metadata: Metadata = {
  title: "Sign in — Nightfold",
  description: "Sign in to save Frames and publish with Nightfold.",
};

export const dynamic = "force-dynamic";

function sanitizeLocalNextPath(value: string | string[] | undefined): string {
  const candidateValue = Array.isArray(value) ? value[0] : value;
  if (!candidateValue?.startsWith("/")) return "/soulframe";
  try {
    const base = new URL("https://nightfold.invalid");
    const candidate = new URL(candidateValue, base);
    if (candidate.origin !== base.origin) return "/soulframe";
    return `${candidate.pathname}${candidate.search}${candidate.hash}`;
  } catch {
    return "/soulframe";
  }
}

const ERROR_MESSAGES: Readonly<Record<string, string>> = {
  oauth_unavailable:
    "Sign-in is not configured or is temporarily unavailable.",
  oauth_callback_failed:
    "The sign-in response could not be verified. Please try again.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{
    next?: string | string[];
    error?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const next = sanitizeLocalNextPath(params.next);
  const errorCode = Array.isArray(params.error) ? params.error[0] : params.error;
  const service = (await getBackendForRequest()).auth;
  if (await service.getSession()) redirect(next);

  return (
    <main className="min-h-screen px-5 py-16 text-ink">
      <PageWidth variant="standard">
        <section className="mx-auto w-full max-w-lg border border-line/70 bg-surface p-6 shadow-panel sm:p-8">
        <p className="font-sans text-2xs font-bold uppercase tracking-[0.18em] text-gold">
          Nightfold account
        </p>
        <h1 className="mt-2 font-display text-3xl uppercase tracking-wide text-gold-bright">
          Sign in
        </h1>
        <p className="mt-3 font-sans text-sm leading-6 text-ink-soft">
          Planning remains available without an account. Sign in only when you
          want cloud Frame storage, voting, or a publishing identity.
        </p>

        {errorCode && ERROR_MESSAGES[errorCode] ? (
          <p
            className="mt-5 border border-danger/60 bg-danger/10 px-3 py-2 font-sans text-sm text-ink"
            role="alert"
          >
            {ERROR_MESSAGES[errorCode]}
          </p>
        ) : null}

        <div className="mt-7 grid gap-3">
          <form action={signInWithDiscordAction}>
            <input type="hidden" name="next" value={next} />
            <button
              type="submit"
              className="min-h-11 w-full cursor-pointer border border-gold bg-control-hover px-4 font-sans text-sm font-bold uppercase tracking-wide text-gold-bright shadow-control-active focus-visible:outline-none focus-visible:shadow-focus"
            >
              Continue with Discord
            </button>
          </form>
          <form action={signInWithTwitchAction}>
            <input type="hidden" name="next" value={next} />
            <button
              type="submit"
              className="min-h-11 w-full cursor-pointer border border-line-bright/60 bg-control px-4 font-sans text-sm font-bold uppercase tracking-wide text-ink hover:border-gold hover:text-gold-bright focus-visible:outline-none focus-visible:shadow-focus"
            >
              Continue with Twitch
            </button>
          </form>
        </div>

        <Link
          href="/soulframe/framer"
          className="mt-6 inline-flex min-h-11 items-center font-sans text-sm font-semibold text-gold no-underline hover:text-gold-bright focus-visible:outline-none focus-visible:shadow-focus"
        >
          Continue without an account
        </Link>
        </section>
      </PageWidth>
    </main>
  );
}
