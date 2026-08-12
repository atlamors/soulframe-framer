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
    "Plan, publish, and explore Soulframe builds with Nightfold.",
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
