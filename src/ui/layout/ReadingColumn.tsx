import type { ReactNode } from "react";
import { PageWidth } from "./PageWidth";

export function ReadingColumn({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <PageWidth variant="standard" className={className}>
      {children}
    </PageWidth>
  );
}
