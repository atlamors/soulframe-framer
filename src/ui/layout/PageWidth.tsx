import type { ReactNode } from "react";

const PAGE_WIDTH_CLASS_NAMES = {
  workspace: "w-full",
  wide: "mx-auto w-full max-w-[72rem]",
  standard: "mx-auto w-full max-w-[42rem]",
} as const;

export type PageWidthVariant = keyof typeof PAGE_WIDTH_CLASS_NAMES;

export function PageWidth({
  children,
  className,
  variant,
}: {
  children: ReactNode;
  className?: string;
  variant: PageWidthVariant;
}) {
  return (
    <div className={`${PAGE_WIDTH_CLASS_NAMES[variant]}${className ? ` ${className}` : ""}`}>
      {children}
    </div>
  );
}
