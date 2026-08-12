import Link from "next/link";
import { redirect } from "next/navigation";
import { getBackendForRequest } from "@/src/server/composition/backend";

export const dynamic = "force-dynamic";

export default async function BuildsPublisherPage() {
  const { auth, publications } = await getBackendForRequest();
  const session = await auth.getSession();
  if (!session) redirect("/auth/sign-in?next=/soulframe/publisher/builds");

  const profile = await auth.getCreatorProfile(session.account.id);
  const owned = (await publications.listOwned({ ownerId: session.account.id }))
    .filter((publication) => publication.profileId === "soulframe.build");

  return (
    <main className="min-h-[calc(100vh-5rem)] px-4 py-8 text-ink sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line/60 pb-5">
          <div>
            <p className="font-sans text-2xs font-bold uppercase tracking-[0.18em] text-gold">
              Publisher
            </p>
            <h1 className="mt-2 font-display text-3xl tracking-wide text-gold-bright">
              Builds
            </h1>
            <p className="mt-2 font-sans text-sm text-ink-soft">
              Draft, publish, and update Soulframe builds.
            </p>
          </div>
          <Link
            href={profile?.publisherEligibility.eligible ? "/soulframe/publisher/builds/new" : "/soulframe/profile?next=/soulframe/publisher/builds/new"}
            className="inline-flex min-h-11 items-center rounded-sm border border-gold bg-control-hover px-4 font-sans text-xs font-bold uppercase tracking-wide text-gold-bright no-underline"
          >
            New build
          </Link>
        </header>

        <section aria-label="Your builds" className="mt-5 grid gap-3">
          {owned.length ? (
            owned.map((publication) => (
              <Link
                key={publication.id}
                href={`/soulframe/publisher/builds/${publication.id}`}
                className="grid min-h-16 gap-2 rounded-md border border-line/55 bg-surface px-4 py-3 no-underline transition-colors hover:border-gold/55 mobile-wide:grid-cols-[minmax(0,1fr)_auto] mobile-wide:items-center"
              >
                <span className="min-w-0">
                  <span className="block truncate font-display text-lg text-gold-bright">
                    {publication.draft.state.metadata.title || "Untitled build"}
                  </span>
                  <span className="mt-1 block truncate font-sans text-xs text-ink-muted">
                    /{publication.slug}
                  </span>
                </span>
                <span className="font-sans text-2xs font-bold uppercase tracking-wide text-ink-soft">
                  {publication.status}
                </span>
              </Link>
            ))
          ) : (
            <div className="rounded-md border border-dashed border-line/60 p-8 text-center font-sans text-sm text-ink-muted">
              No builds yet. Create one when you are ready.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
