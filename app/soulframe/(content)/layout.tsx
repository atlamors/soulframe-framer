import type { ReactNode } from "react";
import { PageWidth } from "@/src/ui/layout";

export default function SoulframeContentLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <PageWidth variant="wide">{children}</PageWidth>;
}
