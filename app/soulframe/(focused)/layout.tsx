import type { ReactNode } from "react";
import { PageWidth } from "@/src/ui/layout";

export default function SoulframeFocusedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <PageWidth variant="standard">{children}</PageWidth>;
}
