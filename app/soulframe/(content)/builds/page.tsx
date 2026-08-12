import type { Metadata } from "next";
import { DiscoveryPage, type DiscoverySearchParams } from "@/src/features/discovery/DiscoveryPage";

export const metadata: Metadata = {
  title: "Builds",
  description: "Discover published Soulframe Builds on Nightfold.",
};

export const dynamic = "force-dynamic";

export default async function SoulframeBuildsPage({ searchParams }: { searchParams: Promise<DiscoverySearchParams> }) {
  return <DiscoveryPage profileId="soulframe.build" searchParams={await searchParams} />;
}
