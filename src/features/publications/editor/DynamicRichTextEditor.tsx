"use client";

import dynamic from "next/dynamic";

export const DynamicRichTextEditor = dynamic(
  () => import("./RichTextEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-36 border border-line/70 bg-surface-deep p-4 font-sans text-sm text-ink-muted">
        Loading restricted editor…
      </div>
    ),
  },
);
