"use client";

import Image from "next/image";
import Link from "next/link";
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
import { SoulframeShellProvider, useSoulframeShell } from "./SoulframeShellContext";
import { SOULFRAME_SHELL_CLASS_NAMES as C } from "./soulframeShellClassNames";

type NavigationItem = {
  label: string;
  icon: LucideIcon;
  href?: string;
  active?: boolean;
};

const NAVIGATION_GROUPS: ReadonlyArray<{
  label: string;
  items: ReadonlyArray<NavigationItem>;
}> = [
  {
    label: "Explore",
    items: [
      { label: "Tier List", icon: ChartNoAxesColumnIncreasing },
      { label: "Starter Builds", icon: Compass },
      { label: "Builds", icon: ListStart },
      { label: "Guides", icon: BookOpen },
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
        active: true,
      },
      { label: "Frame Publisher", icon: FilePenLine },
    ],
  },
  {
    label: "Manage",
    items: [
      { label: "My Frames", icon: FolderHeart },
      { label: "My Builds", icon: Files },
      { label: "My Guides", icon: ScrollText },
      { label: "Profile", icon: UserRound },
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

function NavigationRail() {
  return (
    <nav className={C.rail} aria-label="Soulframe navigation">
      {NAVIGATION_GROUPS.map((group) => (
        <div className={C.railGroup} key={group.label} aria-label={group.label}>
          {group.items.map((item) => {
            const Icon = item.icon;
            const className = `${C.railItem} ${item.active ? C.railItemActive : ""}`;
            const contents = (
              <>
                <Icon className={C.railIcon} aria-hidden="true" />
                <span className={C.railTooltip} role="tooltip">
                  {item.label}
                  {!item.href ? (
                    <span className={C.railTooltipMeta}>Coming soon</span>
                  ) : null}
                </span>
              </>
            );
            return item.href ? (
              <Link
                className={className}
                href={item.href}
                aria-label={item.label}
                aria-current={item.active ? "page" : undefined}
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

function SoulframeChrome({ children }: { children: ReactNode }) {
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
            <button
              type="button"
              className={C.utilityButton}
              aria-disabled="true"
              aria-label="Account, coming soon"
              title="Account — Coming soon"
            >
              <UserRound className={C.utilityIcon} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <NavigationRail />

      <MobileFullscreenOverlay
        open={isSiteMenuOpen}
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
        <div className={C.drawerHeader}>
          <Dialog.Title className={C.drawerTitle}>Soulframe</Dialog.Title>
          <Dialog.Close className={C.drawerClose} aria-label="Close site navigation">
            <X className={C.utilityIcon} aria-hidden="true" />
          </Dialog.Close>
        </div>
        <Dialog.Description className="sr-only">
          Browse Nightfold Soulframe tools and content.
        </Dialog.Description>
        <nav className={C.drawerBody} aria-label="Soulframe site navigation">
          {NAVIGATION_GROUPS.map((group) => (
            <section className={C.drawerGroup} key={group.label}>
              <h2 className={C.drawerGroupTitle}>{group.label}</h2>
              {group.items.map((item) => {
                const Icon = item.icon;
                const className = `${C.drawerItem} ${item.active ? C.drawerItemActive : ""}`;
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
                    aria-current={item.active ? "page" : undefined}
                    key={item.label}
                    onClick={closeSiteMenu}
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

export function SoulframeShell({ children }: { children: ReactNode }) {
  return (
    <SoulframeShellProvider>
      <SoulframeChrome>{children}</SoulframeChrome>
    </SoulframeShellProvider>
  );
}
