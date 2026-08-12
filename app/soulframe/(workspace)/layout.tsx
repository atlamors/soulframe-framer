import type { ReactNode } from "react";
import { PageWidth } from "@/src/ui/layout";

export default function SoulframeWorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <PageWidth variant="workspace">{children}</PageWidth>;
}
