import Link from "next/link";
import { redirect } from "next/navigation";
import {
  archivePublicationAction,
  restorePublicationAction,
} from "@/src/features/publications/actions";
import {
  publicPublicationPath,
  publisherActionMessage,
  publisherEditPath,
} from "@/src/features/publications/publisherRoutes";
import { getBackendForRequest } from "@/src/server/composition/backend";

export const dynamic = "force-dynamic";

type QueryValue = string | string[] | undefined;

function firstValue(value: QueryValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function BuildsPublisherPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: QueryValue; error?: QueryValue }>;
}) {
  const query = await searchParams;
  const { auth, publications } = await getBackendForRequest();
  const session = await auth.getSession();
  if (!session) redirect("/auth/sign-in?next=/soulframe/publisher/builds");

  const profile = await auth.getCreatorProfile(session.account.id);
  const owned = (await publications.listOwned({
    ownerId: session.account.id,
    includeDeleted: true,
  }))
    .filter((publication) => publication.profileId === "soulframe.build");
  const active = owned.filter((publication) => publication.status !== "deleted");
  const archived = owned.filter((publication) => publication.status === "deleted");
  const message = publisherActionMessage(
    firstValue(query.notice),
    firstValue(query.error),
  );
  // This server-rendered request timestamp gates the bounded recovery action.
  // eslint-disable-next-line react-hooks/purity
  const renderedAt = Date.now();

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

        {message ? (
          <p
            role={message.tone === "error" ? "alert" : "status"}
            className={`mt-4 rounded-sm border px-3 py-2 font-sans text-sm ${
              message.tone === "error"
                ? "border-red-400/45 text-red-200"
                : "border-gold/45 text-gold-bright"
            }`}
          >
            {message.text}
          </p>
        ) : null}

        <section aria-label="Your builds" className="mt-5 grid gap-3">
          {active.length ? (
            active.map((publication) => (
              <article
                key={publication.id}
                className="grid min-h-16 gap-3 rounded-md border border-line/55 bg-surface px-4 py-3 mobile-wide:grid-cols-[minmax(0,1fr)_auto] mobile-wide:items-center"
              >
                <div className="min-w-0">
                  <Link
                    href={publisherEditPath(publication.profileId, publication.id)}
                    className="block truncate font-display text-lg text-gold-bright no-underline hover:underline"
                  >
                    {publication.draft.state.metadata.title || "Untitled build"}
                  </Link>
                  <span className="mt-1 block truncate font-sans text-xs text-ink-muted">
                    /{publication.slug}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 mobile-wide:justify-end">
                  <span className="font-sans text-2xs font-bold uppercase tracking-wide text-ink-soft">
                    {publication.status}
                  </span>
                  {publication.status === "published" ? (
                    <Link
                      href={publicPublicationPath(publication.profileId, publication.slug)}
                      className="font-sans text-xs font-bold uppercase text-gold-bright no-underline hover:underline"
                    >
                      View published
                    </Link>
                  ) : (
                    <form action={archivePublicationAction}>
                      <input type="hidden" name="publicationId" value={publication.id} />
                      <button
                        type="submit"
                        className="min-h-9 rounded-sm border border-red-400/40 px-3 font-sans text-xs font-bold uppercase text-red-200 hover:bg-control"
                      >
                        Archive
                      </button>
                    </form>
                  )}
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-md border border-dashed border-line/60 p-8 text-center font-sans text-sm text-ink-muted">
              No builds yet. Create one when you are ready.
            </div>
          )}
        </section>

        {archived.length ? (
          <details className="mt-6 border-t border-line/45 pt-4">
            <summary className="cursor-pointer font-sans text-xs font-bold uppercase tracking-wide text-ink-muted">
              Archived ({archived.length})
            </summary>
            <div className="mt-3 grid gap-2">
              {archived.map((publication) => {
                const recovery = publication.deletionRecovery;
                const recoverable = Boolean(
                  recovery && Date.parse(recovery.recoverableUntil) > renderedAt,
                );
                return (
                  <div
                    key={publication.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-line/40 bg-surface/55 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-display text-base text-ink-soft">
                        {publication.draft.state.metadata.title || "Untitled build"}
                      </p>
                      {recovery ? (
                        <p className="mt-1 font-sans text-xs text-ink-muted">
                          {recoverable
                            ? `Recoverable through ${recovery.recoverableUntil.slice(0, 10)}`
                            : "Recovery window expired"}
                        </p>
                      ) : null}
                    </div>
                    {recoverable ? (
                      <form action={restorePublicationAction}>
                        <input type="hidden" name="publicationId" value={publication.id} />
                        <button
                          type="submit"
                          className="min-h-9 rounded-sm border border-gold/55 px-3 font-sans text-xs font-bold uppercase text-gold-bright hover:bg-control"
                        >
                          Restore
                        </button>
                      </form>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </details>
        ) : null}
      </div>
    </main>
  );
}
