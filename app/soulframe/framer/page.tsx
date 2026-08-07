import type { Metadata } from "next";
import { SoulframeBuilder } from "../../SoulframeBuilder";

export const metadata: Metadata = {
  title: "Framer",
  description:
    "Frame a Soulframe armor loadout, tune Courage, Spirit, and Grace, and compare verified defense scaling.",
};

export default function SoulframeFramerPage() {
  return <SoulframeBuilder />;
}
