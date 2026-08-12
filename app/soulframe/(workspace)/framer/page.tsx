import type { Metadata } from "next";
import { SoulframeBuilder } from "@/app/SoulframeBuilder";
import { getBackendForRequest } from "@/src/server/composition/backend";

export const metadata: Metadata = {
  title: "Framer",
  description:
    "Frame a Soulframe armor loadout, tune Courage, Spirit, and Grace, and compare verified defense scaling.",
};

export default async function SoulframeFramerPage() {
  const auth = (await getBackendForRequest()).auth;
  const session = await auth.getSession();
  return <SoulframeBuilder artifactOwnerId={session?.account.id ?? null} />;
}
