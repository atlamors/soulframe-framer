import type { Metadata } from "next";
import Link from "next/link";
import { CreatorProfileForm } from "@/src/features/auth/CreatorProfileForm";
import { getBackendForRequest } from "@/src/server/composition/backend";

export const metadata: Metadata = {
  title: "Creator Profile",
  description: "Manage the public identity used for Nightfold publishing.",
};

export const dynamic = "force-dynamic";

function sanitizePublisherReturnPath(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.startsWith("/")) return undefined;
  try {
    const base = new URL("https://nightfold.invalid");
    const candidate = new URL(value, base);
    if (candidate.origin !== base.origin || candidate.hash) return undefined;
    if (candidate.pathname === "/soulframe/publisher") {
      return `${candidate.pathname}${candidate.search}`;
    }
    if (candidate.pathname === "/soulframe/publisher/new") {
      return `${candidate.pathname}${candidate.search}`;
    }
    if (/^\/soulframe\/publisher\/(builds|guides)(?:\/[^/]+)?$/.test(candidate.pathname)) {
      return `${candidate.pathname}${candidate.search}`;
    }
    if (
      /^\/soulframe\/publisher\/[^/]+$/.test(candidate.pathname) &&
      !candidate.search
    ) {
      return candidate.pathname;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

export default async function CreatorProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const query = await searchParams;
  const returnTo = sanitizePublisherReturnPath(
    Array.isArray(query.next) ? query.next[0] : query.next,
  );
  const profilePath = returnTo
    ? `/soulframe/profile?${new URLSearchParams({ next: returnTo })}`
    : "/soulframe/profile";
  const signInHref = `/auth/sign-in?${new URLSearchParams({ next: profilePath })}`;
  const service = (await getBackendForRequest()).auth;
  const session = await service.getSession();

  if (!session) {
    return (
      <main className="min-h-[calc(100vh-5rem)] px-5 py-12 text-ink">
        <section className="border border-line/70 bg-surface p-6 shadow-panel sm:p-8">
          <p className="font-sans text-2xs font-bold uppercase tracking-[0.18em] text-gold">
            Creator Profile
          </p>
          <h1 className="mt-2 font-display text-3xl uppercase tracking-wide text-gold-bright">
            Sign in required
          </h1>
          <p className="mt-3 font-sans text-sm leading-6 text-ink-soft">
            A Nightfold account is required to activate a public Creator
            Profile and publish. The Framer remains available without signing
            in.
          </p>
          <Link
            href={signInHref}
            className="mt-6 inline-flex min-h-11 items-center border border-gold bg-control-hover px-4 font-sans text-sm font-bold uppercase tracking-wide text-gold-bright no-underline shadow-control-active focus-visible:outline-none focus-visible:shadow-focus"
          >
            Sign in
          </Link>
        </section>
      </main>
    );
  }

  const profile = await service.getCreatorProfile(session.account.id);
  const suggestedDisplayName =
    profile?.displayName ??
    session.account.displayName ??
    session.account.email?.split("@")[0] ??
    "";

  return (
    <main className="min-h-[calc(100vh-5rem)] px-5 py-12 text-ink">
      <section className="border border-line/70 bg-surface p-6 shadow-panel sm:p-8">
        <p className="font-sans text-2xs font-bold uppercase tracking-[0.18em] text-gold">
          Publishing identity
        </p>
        <h1 className="mt-2 font-display text-3xl uppercase tracking-wide text-gold-bright">
          Creator Profile
        </h1>
        <p className="mt-3 font-sans text-sm leading-6 text-ink-soft">
          Your account stays private. Activate this optional public profile when
          you are ready to publish Builds or Guides.
        </p>

        {profile ? (
          <p className="mt-5 border border-line/60 bg-surface-deep px-3 py-2 font-sans text-sm text-ink-soft">
            Publishing status: {profile.publisherEligibility.eligible ? "Eligible" : "Disabled"}
          </p>
        ) : (
          <p className="mt-5 border border-gold/40 bg-aura-gold px-3 py-2 font-sans text-sm text-ink-soft">
            A Creator Profile is required before you can publish.
          </p>
        )}

        <CreatorProfileForm
          profile={profile}
          suggestedDisplayName={suggestedDisplayName}
          returnTo={returnTo}
        />
      </section>
    </main>
  );
}
