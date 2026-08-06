import type { ReactNode } from "react";
import Image from "next/image";
import { DoubleRopeFrame } from "../components/DoubleRopeFrame";
import { MOBILE_SUPPORT_ZONE_CLASS_NAMES } from "./mobileSupportZoneClassNames";

function PatreonMark() {
  return (
    <svg
      className={MOBILE_SUPPORT_ZONE_CLASS_NAMES.supportLogo}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M3 3h4v18H3V3Zm12.25 0a6.75 6.75 0 1 1 0 13.5 6.75 6.75 0 0 1 0-13.5Z" />
    </svg>
  );
}

function KoFiMark() {
  return (
    <svg
      className={MOBILE_SUPPORT_ZONE_CLASS_NAMES.supportLogo}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 6.5h13v7A5.5 5.5 0 0 1 11.5 19h-2A5.5 5.5 0 0 1 4 13.5v-7Z" />
      <path d="M17 8h1.25a2.75 2.75 0 0 1 0 5.5H17" />
      <path d="M8 10.25c0-1.5 2-1.75 2.5-.5.5-1.25 2.5-1 2.5.5 0 1.25-1.35 2.25-2.5 3.1-1.15-.85-2.5-1.85-2.5-3.1Z" />
    </svg>
  );
}

function PendingSupportLink({
  name,
  logo,
}: {
  name: string;
  logo: ReactNode;
}) {
  return (
    <span
      className={MOBILE_SUPPORT_ZONE_CLASS_NAMES.supportLink}
      aria-disabled="true"
      title={`${name} support link coming soon`}
    >
      {logo}
      <span className={MOBILE_SUPPORT_ZONE_CLASS_NAMES.supportLinkCopy}>
        <span className={MOBILE_SUPPORT_ZONE_CLASS_NAMES.supportLinkName}>
          {name}
        </span>
        <span className={MOBILE_SUPPORT_ZONE_CLASS_NAMES.supportLinkState}>
          Coming soon
        </span>
      </span>
    </span>
  );
}

export function MobileSupportZone() {
  return (
    <section
      className={MOBILE_SUPPORT_ZONE_CLASS_NAMES.root}
      aria-label="Advertisement and support options"
    >
      <div
        className={MOBILE_SUPPORT_ZONE_CLASS_NAMES.adPlaceholder}
        role="img"
        aria-label="Responsive advertisement placeholder: 300 by 250 on mobile, up to 728 by 90 on larger screens, and up to 970 by 90 on wide screens"
      >
        <Image
          className={MOBILE_SUPPORT_ZONE_CLASS_NAMES.adFrame}
          src="/login-frame/ad-frame-neutral.svg?v=2"
          alt=""
          aria-hidden="true"
          fill
          sizes="(max-width: 680px) 300px, (min-width: 1367px) min(970px, 71vw), min(728px, 100vw)"
          unoptimized
        />
        <DoubleRopeFrame
          className={MOBILE_SUPPORT_ZONE_CLASS_NAMES.adDesktopFrame}
        />
        <span className={MOBILE_SUPPORT_ZONE_CLASS_NAMES.adEyebrow}>
          Advertisement
        </span>
        <strong className={MOBILE_SUPPORT_ZONE_CLASS_NAMES.adSize}>
          <span className={MOBILE_SUPPORT_ZONE_CLASS_NAMES.adSizeMobile}>
            300 × 250
          </span>
          <span className={MOBILE_SUPPORT_ZONE_CLASS_NAMES.adSizeDesktop}>
            Up to 728 × 90
          </span>
          <span className={MOBILE_SUPPORT_ZONE_CLASS_NAMES.adSizeWide}>
            Up to 970 × 90
          </span>
        </strong>
        <span className={MOBILE_SUPPORT_ZONE_CLASS_NAMES.adNote}>
          Responsive AdSense placement
        </span>
      </div>

      <div className={MOBILE_SUPPORT_ZONE_CLASS_NAMES.support}>
        <h2 className={MOBILE_SUPPORT_ZONE_CLASS_NAMES.supportHeading}>
          Support Framer
        </h2>
        <p className={MOBILE_SUPPORT_ZONE_CLASS_NAMES.supportCopy}>
          Enjoying Framer? Help keep it independent.
        </p>
        <div className={MOBILE_SUPPORT_ZONE_CLASS_NAMES.supportLinks}>
          <PendingSupportLink name="Patreon" logo={<PatreonMark />} />
          <PendingSupportLink name="Ko-fi" logo={<KoFiMark />} />
        </div>
      </div>
    </section>
  );
}
