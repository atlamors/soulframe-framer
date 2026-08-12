import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getBackendForRequest } from "../../src/server/composition/backend";
import { SoulframeShell } from "./components/SoulframeShell";

export const metadata: Metadata = {
  title: {
    default: "Soulframe — Nightfold",
    template: "%s — Nightfold",
  },
  description:
    "Plan Soulframe builds, publish guides, and discover community knowledge on Nightfold.",
  openGraph: {
    type: "website",
    siteName: "Nightfold",
    images: [
      {
        url: "/social/cards/soulframe-v1.png",
        width: 1200,
        height: 630,
        alt: "Nightfold — Soulframe builds, guides, and community knowledge",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [
      {
        url: "/social/cards/soulframe-v1.png",
        width: 1200,
        height: 630,
        alt: "Nightfold — Soulframe builds, guides, and community knowledge",
      },
    ],
  },
};

export const dynamic = "force-dynamic";

export default async function SoulframeLayout({
  children,
}: {
  children: ReactNode;
}) {
  const auth = (await getBackendForRequest()).auth;
  const session = await auth.getSession();
  return <SoulframeShell authSession={session}>{children}</SoulframeShell>;
}
