import type { ReactNode } from "react";

export function SectionFrame({
  title,
  actions,
  children,
  padded = true,
}: {
  title: string;
  kicker?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  padded?: boolean;
}) {
  return (
    <section className="rounded-md border border-line/40 bg-surface-raised/55">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line/55 px-4 py-2.5">
        <h2 className="min-w-0 font-sans text-sm font-bold uppercase tracking-[0.08em] text-ink">
          {title}
        </h2>
        {actions ? <div className="flex-none">{actions}</div> : null}
      </header>
      <div className={padded ? "p-4" : undefined}>{children}</div>
    </section>
  );
}
