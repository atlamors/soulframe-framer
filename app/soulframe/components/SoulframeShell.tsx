"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import {
  BookOpen,
  ChartNoAxesColumnIncreasing,
  Compass,
  FilePenLine,
  Files,
  FolderHeart,
  Hammer,
  ListStart,
  Menu,
  ScrollText,
  Sparkles,
  UserRound,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  useCallback,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AlertCenterTrigger, useAlerts } from "../../alerts/AlertsProvider";
import { MobileFullscreenOverlay } from "../../components/MobileFullscreenOverlay";
import { useMobileHistoryLayer } from "../../hooks/useMobileHistoryLayer";
import { AccountControl } from "../../../src/features/auth/AccountControl";
import type { AuthSession } from "../../../src/server/contracts/auth";
import { SoulframeShellProvider, useSoulframeShell } from "./SoulframeShellContext";
import { SOULFRAME_SHELL_CLASS_NAMES as C } from "./soulframeShellClassNames";

type NavigationItem = {
  label: string;
  icon: LucideIcon;
  href?: string;
};

function DiscordIcon({ className }: { className: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M20.317 4.37a19.8 19.8 0 0 0-4.885-1.516.07.07 0 0 0-.079.037c-.211.376-.445.865-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.618-1.25.08.08 0 0 0-.078-.037A19.74 19.74 0 0 0 3.677 4.37a.07.07 0 0 0-.032.028C.533 9.046-.319 13.58.099 18.058a.08.08 0 0 0 .031.056c2.053 1.508 4.041 2.423 5.993 3.03a.08.08 0 0 0 .084-.028c.462-.63.873-1.295 1.226-1.994a.08.08 0 0 0-.042-.106 12.3 12.3 0 0 1-1.872-.892.08.08 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.07.07 0 0 1 .078-.01c3.928 1.793 8.18 1.793 12.061 0a.07.07 0 0 1 .079.009c.12.099.246.198.373.292a.08.08 0 0 1-.007.128c-.597.343-1.22.645-1.873.891a.08.08 0 0 0-.041.107c.36.698.772 1.363 1.225 1.993a.08.08 0 0 0 .084.029c1.961-.607 3.95-1.522 6.002-3.03a.08.08 0 0 0 .032-.055c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.03ZM8.02 15.331c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.419 0 1.333-.956 2.419-2.157 2.419Zm7.975 0c-1.183 0-2.157-1.086-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.419 0 1.333-.946 2.419-2.157 2.419Z" />
    </svg>
  );
}

const NAVIGATION_GROUPS: ReadonlyArray<{
  label: string;
  items: ReadonlyArray<NavigationItem>;
}> = [
  {
    label: "Explore",
    items: [
      { label: "Tier List", icon: ChartNoAxesColumnIncreasing },
      { label: "Starter Builds", icon: Compass },
      { label: "Builds", icon: ListStart, href: "/soulframe/builds" },
      { label: "Guides", icon: BookOpen, href: "/soulframe/guides" },
      { label: "Creators", icon: Users },
    ],
  },
  {
    label: "Create",
    items: [
      {
        label: "Framer",
        icon: Hammer,
        href: "/soulframe/framer",
      },
      {
        label: "Build Publisher",
        icon: FilePenLine,
        href: "/soulframe/publisher/builds",
      },
      { label: "Guide Publisher", icon: ScrollText, href: "/soulframe/publisher/guides" },
    ],
  },
  {
    label: "Manage",
    items: [
      { label: "My Frames", icon: FolderHeart },
      { label: "My Builds", icon: Files },
      { label: "My Guides", icon: ScrollText },
      { label: "Profile", icon: UserRound, href: "/soulframe/profile" },
    ],
  },
];

function ComingSoonButton({
  item,
  className,
  children,
}: {
  item: NavigationItem;
  className: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={className}
      aria-disabled="true"
      aria-label={`${item.label}, coming soon`}
      title={`${item.label} — Coming soon`}
    >
      {children}
    </button>
  );
}

function isNavigationItemActive(
  pathname: string,
  item: NavigationItem,
): boolean {
  return Boolean(
    item.href &&
      (pathname === item.href || pathname.startsWith(`${item.href}/`)),
  );
}

function NavigationRail({ pathname }: { pathname: string }) {
  return (
    <nav className={C.rail} aria-label="Soulframe navigation">
      {NAVIGATION_GROUPS.map((group) => (
        <div className={C.railGroup} key={group.label} aria-label={group.label}>
          {group.items.map((item) => {
            const Icon = item.icon;
            const isActive = isNavigationItemActive(pathname, item);
            const className = `${C.railItem} ${isActive ? C.railItemActive : ""}`;
            const contents = (
              <>
                <Icon className={C.railIcon} aria-hidden="true" />
                <span className={C.railLabel}>
                  {item.label}
                </span>
                {!item.href ? (
                  <span className={C.railItemMeta}>Soon</span>
                ) : null}
              </>
            );
            return item.href ? (
              <Link
                className={className}
                href={item.href}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                key={item.label}
              >
                {contents}
              </Link>
            ) : (
              <ComingSoonButton
                className={className}
                item={item}
                key={item.label}
              >
                {contents}
              </ComingSoonButton>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function SoulframeChrome({
  children,
  authSession,
}: {
  children: ReactNode;
  authSession: AuthSession | null;
}) {
  const pathname = usePathname();
  const { aiAction } = useSoulframeShell();
  const { closeAlertCenter, setMobileHeaderLayerElement } = useAlerts();
  const [isSiteMenuOpen, setIsSiteMenuOpen] = useState(false);
  const siteMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const siteMenuContentRef = useRef<HTMLElement>(null);
  const dismissSiteMenu = useCallback(() => setIsSiteMenuOpen(false), []);
  const closeSiteMenu = useMobileHistoryLayer({
    id: "soulframe-site-navigation",
    isOpen: isSiteMenuOpen,
    onDismiss: dismissSiteMenu,
  });
  const setHeaderPortalLayer = useCallback(
    (element: HTMLDivElement | null) => {
      setMobileHeaderLayerElement(element);
    },
    [setMobileHeaderLayerElement],
  );
  const openSiteMenu = () => {
    closeAlertCenter();
    aiAction?.onDismiss();
    setIsSiteMenuOpen(true);
  };

  return (
    <div className={C.root}>
      <div ref={setHeaderPortalLayer} className={C.headerPortalLayer} />
      <header className={C.header}>
        <div className={C.headerInner}>
          <button
            ref={siteMenuTriggerRef}
            type="button"
            className={C.menuTrigger}
            aria-label={isSiteMenuOpen ? "Close site navigation" : "Open site navigation"}
            aria-haspopup="dialog"
            aria-expanded={isSiteMenuOpen}
            aria-controls="soulframe-site-navigation"
            onClick={isSiteMenuOpen ? closeSiteMenu : openSiteMenu}
          >
            {isSiteMenuOpen ? (
              <X className={C.headerIcon} aria-hidden="true" />
            ) : (
              <Menu className={C.headerIcon} aria-hidden="true" />
            )}
          </button>

          <Link className={C.brand} href="/soulframe" aria-label="Nightfold Soulframe home">
            <Image
              className={C.brandWordmark}
              src="/brand/nightfold-wordmark.png"
              alt="Nightfold"
              width={2035}
              height={773}
              priority
              unoptimized
            />
          </Link>
          <span className={C.gameContext}>Soulframe</span>

          <div className={C.utilities} aria-label="Page utilities">
            <span className={C.externalUtilityGroup}>
              <a
                className={C.utilityButton}
                href="https://discord.gg/UHyaEsPqZs"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Join Nightfold on Discord"
                title="Join Nightfold on Discord"
              >
                <DiscordIcon className={C.utilityIcon} />
              </a>
            </span>
            <button
              type="button"
              className={`${C.utilityButton} ${aiAction?.isActive ? C.utilityButtonActive : ""}`}
              aria-label={aiAction?.label ?? "Contextual tool unavailable"}
              aria-expanded={aiAction?.isActive ?? false}
              aria-controls={aiAction ? "builder-optimization" : undefined}
              aria-disabled={!aiAction}
              title={aiAction?.label ?? "Contextual tool unavailable"}
              onClick={() => {
                if (!aiAction) return;
                closeAlertCenter();
                aiAction.onToggle();
              }}
            >
              <Sparkles className={C.utilityIcon} aria-hidden="true" />
            </button>
            <span inert={aiAction?.isActive ? true : undefined}>
              <AlertCenterTrigger
                classNames={{
                  root: C.utilityButton,
                  activeRoot: C.utilityButtonActive,
                  icon: C.utilityIcon,
                  badge: C.alertBadge,
                }}
                tabIndex={aiAction?.isActive ? -1 : undefined}
              />
            </span>
            <AccountControl
              session={authSession}
              nextPath={pathname || "/soulframe"}
              buttonClassName={C.utilityButton}
              iconClassName={C.utilityIcon}
            />
          </div>
        </div>
      </header>

      <span className={C.chromeJoint} aria-hidden="true">
        <span className={C.chromeJointCircle} />
      </span>

      <NavigationRail pathname={pathname} />

      <MobileFullscreenOverlay
        open={isSiteMenuOpen}
        modal={false}
        onOpenChange={(open) => {
          if (!open) closeSiteMenu();
        }}
        id="soulframe-site-navigation"
        triggerRef={siteMenuTriggerRef}
        contentRef={siteMenuContentRef}
        className={C.drawer}
        overlayClassName={C.drawerOverlay}
        portalContainer={undefined}
      >
        <Dialog.Title className="sr-only">Soulframe navigation</Dialog.Title>
        <Dialog.Description className="sr-only">
          Browse Nightfold Soulframe tools and content.
        </Dialog.Description>
        <nav className={C.drawerBody} aria-label="Soulframe site navigation">
          {NAVIGATION_GROUPS.map((group) => (
            <section className={C.drawerGroup} key={group.label}>
              <h2 className={C.drawerGroupTitle}>{group.label}</h2>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = isNavigationItemActive(pathname, item);
                const className = `${C.drawerItem} ${isActive ? C.drawerItemActive : ""}`;
                const contents = (
                  <>
                    <Icon className={C.drawerItemIcon} aria-hidden="true" />
                    <span className={C.drawerItemLabel}>{item.label}</span>
                    {!item.href ? (
                      <span className={C.comingSoon}>Coming soon</span>
                    ) : null}
                  </>
                );
                return item.href ? (
                  <Link
                    className={className}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    key={item.label}
                    onClick={dismissSiteMenu}
                  >
                    {contents}
                  </Link>
                ) : (
                  <ComingSoonButton
                    className={className}
                    item={item}
                    key={item.label}
                  >
                    {contents}
                  </ComingSoonButton>
                );
              })}
            </section>
          ))}
        </nav>
      </MobileFullscreenOverlay>

      <div className={C.content}>{children}</div>
    </div>
  );
}

export function SoulframeShell({
  children,
  authSession,
}: {
  children: ReactNode;
  authSession: AuthSession | null;
}) {
  return (
    <SoulframeShellProvider>
      <SoulframeChrome authSession={authSession}>{children}</SoulframeChrome>
    </SoulframeShellProvider>
  );
}
