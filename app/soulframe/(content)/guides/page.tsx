import type { Metadata } from "next";
import { DiscoveryPage, type DiscoverySearchParams } from "@/src/features/discovery/DiscoveryPage";

export const metadata: Metadata = {
  title: "Guides",
  description: "Discover Soulframe Guides on Nightfold.",
};

export const dynamic = "force-dynamic";

export default async function SoulframeGuidesPage({ searchParams }: { searchParams: Promise<DiscoverySearchParams> }) {
  return <DiscoveryPage profileId="soulframe.guide" searchParams={await searchParams} />;
}
