import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SoulframeShell } from "./components/SoulframeShell";

export const metadata: Metadata = {
  title: {
    default: "Soulframe — Nightfold",
    template: "%s — Nightfold",
  },
  description:
    "Plan, publish, and explore Soulframe builds with Nightfold.",
};

export default function SoulframeLayout({ children }: { children: ReactNode }) {
  return <SoulframeShell>{children}</SoulframeShell>;
}
