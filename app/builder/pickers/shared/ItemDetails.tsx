"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { ExternalLink } from "lucide-react";
import { useMobileHistoryLayer } from "@/app/hooks/useMobileHistoryLayer";
import { armorDropById } from "@/src/data/armor-drops";
import {
  dropLocationMapAsset,
  dropLocationMapBySourceUrl,
  dropLocationMapCuratedIcons,
  type DropLocationMap,
} from "@/src/data/drop-location-maps";
import { weaponDropById } from "@/src/data/weapon-drops";
import {
  DEFENSE_IDS,
  VIRTUE_IDS,
  type ArmorItem,
  type ItemContribution,
  type Weapon,
} from "@/src/domain/types";
import { StatIcon } from "../../components/primitives";
import { defenseMeta, virtueMeta } from "../../constants";
import { formatDelta, formatVirtueVector } from "../../lib/formatters";
import {
  ARMOR_BASE_STAT_CLASS_NAMES,
  ARMOR_OVERVIEW_DELTA_CLASS_NAMES,
  ARMOR_PIP_CLASS_NAMES,
  DROP_HEAD_CELL_CLASS_NAMES,
  DROP_LOCATION_CELL_CLASS_NAMES,
  DROP_LOCATION_MARKER_CLASS_NAMES,
  DROP_LOCATION_TRIGGER_CLASS_NAMES,
  DROP_LOCATION_TRIGGER_IMAGE_CLASS_NAME,
  DROP_MAP_PAGE_CLASS_NAMES,
  DROP_MARKER_IMAGE_CLASS_NAMES,
  DROP_ROW_CLASS_NAMES,
  ITEM_DETAILS_CLASS_NAMES,
  ITEM_STAT_DELTA_CLASS_NAMES,
  LOCAL_MAP_FRAME_CLASS_NAMES,
  type LocalMapAppearance,
} from "./itemDetailsClassNames";

export function ArmorBaseOverview({
  item,
  contribution,
  comparison,
}: {
  item: ArmorItem;
  contribution: ItemContribution;
  comparison?: ItemContribution;
}) {
  const totalDelta = comparison
    ? contribution.total - comparison.total
    : undefined;

  return (
    <section
      className={ITEM_DETAILS_CLASS_NAMES.armorOverview}
      aria-label="Base armor and pips"
    >
      <header className={ITEM_DETAILS_CLASS_NAMES.armorOverviewHeader}>
        <span>Armor Defense</span>
      </header>
      <div className={ITEM_DETAILS_CLASS_NAMES.armorOverviewGrid}>
        {DEFENSE_IDS.map((defense, defenseIndex) => {
          const profile = item.defenses[defense];
          const result = contribution.defenses[defense];
          const pips = VIRTUE_IDS.flatMap((virtue) =>
            Array.from({ length: profile.pips[virtue] }, (_, index) => ({
              virtue,
              id: `${virtue}-${index}`,
            })),
          );

          return (
            <div
              className={
                ARMOR_BASE_STAT_CLASS_NAMES[
                  defenseIndex === DEFENSE_IDS.length - 1 ? "last" : "default"
                ]
              }
              key={defense}
            >
              <small className={ITEM_DETAILS_CLASS_NAMES.armorStatLabel}>
                {defenseMeta[defense].shortLabel}
              </small>
              <span className={ITEM_DETAILS_CLASS_NAMES.armorStatValue}>
                <StatIcon
                  src={defenseMeta[defense].icon}
                  label={defenseMeta[defense].label}
                  size="regular"
                  appearance="armorStat"
                />
                <strong
                  className={ITEM_DETAILS_CLASS_NAMES.armorStatValueNumber}
                >
                  {result.total}
                </strong>
              </span>
              <em className={ITEM_DETAILS_CLASS_NAMES.armorStatMeta}>
                Base {result.base} · +{result.scaling} Virtue
              </em>
              <span
                className={ITEM_DETAILS_CLASS_NAMES.armorPipStrip}
                aria-label={formatVirtueVector(profile.pips) || "No pips"}
              >
                {pips.length ? (
                  pips.map(({ virtue, id }) => (
                    <span
                      className={ARMOR_PIP_CLASS_NAMES[virtue]}
                      key={id}
                      title={`${virtueMeta[virtue].label} pip`}
                    >
                      <Image
                        className={ITEM_DETAILS_CLASS_NAMES.armorPipImage}
                        src={virtueMeta[virtue].icon}
                        alt=""
                        width={18}
                        height={18}
                        unoptimized
                      />
                    </span>
                  ))
                ) : (
                  <span className={ITEM_DETAILS_CLASS_NAMES.armorNoPips}>
                    —
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
      <footer className={ITEM_DETAILS_CLASS_NAMES.armorOverviewTotal}>
        <span className={ITEM_DETAILS_CLASS_NAMES.armorOverviewPrimaryTotal}>
          <small
            className={ITEM_DETAILS_CLASS_NAMES.armorOverviewTotalLabel}
          >
            Total Armor
          </small>
          <strong
            className={ITEM_DETAILS_CLASS_NAMES.armorOverviewTotalValue}
          >
            {contribution.total}
          </strong>
        </span>
        {totalDelta !== undefined && totalDelta !== 0 ? (
          <span className={ITEM_DETAILS_CLASS_NAMES.armorOverviewChangeTotal}>
            <small
              className={ITEM_DETAILS_CLASS_NAMES.armorOverviewTotalLabel}
            >
              Overall Change
            </small>
            <strong
              className={
                ARMOR_OVERVIEW_DELTA_CLASS_NAMES[
                  totalDelta > 0
                    ? "positive"
                    : totalDelta < 0
                      ? "negative"
                      : "neutral"
                ]
              }
            >
              {formatDelta(totalDelta)}
            </strong>
          </span>
        ) : null}
      </footer>
    </section>
  );
}

export function ArmorDropTable({ item }: { item: ArmorItem }) {
  const sources = armorDropById.get(item.id)?.sources ?? [];

  return (
    <section
      className={ITEM_DETAILS_CLASS_NAMES.dropSection}
      aria-labelledby="armor-drop-title"
    >
      <header className={ITEM_DETAILS_CLASS_NAMES.dropSectionHeader}>
        <h4
          className={ITEM_DETAILS_CLASS_NAMES.dropSectionTitle}
          id="armor-drop-title"
        >
          Drop Sources
        </h4>
        <small className={ITEM_DETAILS_CLASS_NAMES.dropSectionMeta}>
          {sources.length ? `${sources.length} recorded` : "Avakot"}
        </small>
      </header>
      {sources.length ? (
        <div
          className={ITEM_DETAILS_CLASS_NAMES.dropTable}
          role="table"
          aria-label="Drop sources"
        >
          <div className={DROP_ROW_CLASS_NAMES.head} role="row">
            <span
              className={DROP_HEAD_CELL_CLASS_NAMES.first}
              role="columnheader"
            >
              Source
            </span>
            <span
              className={DROP_HEAD_CELL_CLASS_NAMES.other}
              role="columnheader"
            >
              Type
            </span>
            <span
              className={DROP_HEAD_CELL_CLASS_NAMES.other}
              role="columnheader"
            >
              Drop
            </span>
            <span
              className={DROP_HEAD_CELL_CLASS_NAMES.other}
              role="columnheader"
            >
              Location
            </span>
          </div>
          {sources.map((source) => (
            <div
              className={DROP_ROW_CLASS_NAMES.body}
              role="row"
              key={`${source.tableId}-${source.sourceName}-${source.level}`}
            >
              <span
                className={ITEM_DETAILS_CLASS_NAMES.dropSourceExternalCell}
                role="cell"
              >
                <a
                  className={ITEM_DETAILS_CLASS_NAMES.dropSourceLink}
                  href={source.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {source.sourceName}
                  <ExternalLink
                    className={ITEM_DETAILS_CLASS_NAMES.dropSourceLinkIcon}
                    aria-hidden="true"
                  />
                </a>
              </span>
              <span className={ITEM_DETAILS_CLASS_NAMES.dropCell} role="cell">
                {source.category || "Source"}
              </span>
              <span
                className={ITEM_DETAILS_CLASS_NAMES.dropDetailCell}
                role="cell"
              >
                {source.fragment ? "Fragment" : "Item"}
                {source.quantity !== "1" ? ` ×${source.quantity}` : ""}
                {source.level ? ` · Lv ${source.level}` : ""}
                {source.note ? (
                  <small className={ITEM_DETAILS_CLASS_NAMES.dropDetailNote}>
                    {source.note}
                  </small>
                ) : null}
              </span>
              <DropLocationLink
                sourceName={source.sourceName}
                sourceUrl={source.sourceUrl}
                display="location"
              />
            </div>
          ))}
        </div>
      ) : (
        <p className={ITEM_DETAILS_CLASS_NAMES.dropEmpty}>
          No drop source is currently recorded by Avakot.
        </p>
      )}
    </section>
  );
}

export function WeaponDropTable({ item }: { item: Weapon }) {
  const sources = weaponDropById.get(item.id)?.sources ?? [];

  return (
    <section
      className={ITEM_DETAILS_CLASS_NAMES.dropSection}
      aria-labelledby="weapon-drop-title"
    >
      <header className={ITEM_DETAILS_CLASS_NAMES.dropSectionHeader}>
        <h4
          className={ITEM_DETAILS_CLASS_NAMES.dropSectionTitle}
          id="weapon-drop-title"
        >
          Drop Locations
        </h4>
        <small className={ITEM_DETAILS_CLASS_NAMES.dropSectionMeta}>
          {sources.length ? `${sources.length} recorded` : "Avakot"}
        </small>
      </header>
      {sources.length ? (
        <div
          className={ITEM_DETAILS_CLASS_NAMES.dropTable}
          role="table"
          aria-label="Weapon drop locations"
        >
          <div className={DROP_ROW_CLASS_NAMES.head} role="row">
            <span
              className={DROP_HEAD_CELL_CLASS_NAMES.first}
              role="columnheader"
            >
              Source
            </span>
            <span
              className={DROP_HEAD_CELL_CLASS_NAMES.other}
              role="columnheader"
            >
              Type
            </span>
            <span
              className={DROP_HEAD_CELL_CLASS_NAMES.other}
              role="columnheader"
            >
              Drop
            </span>
            <span
              className={DROP_HEAD_CELL_CLASS_NAMES.other}
              role="columnheader"
            >
              Location
            </span>
          </div>
          {sources.map((source) => (
            <div
              className={DROP_ROW_CLASS_NAMES.body}
              role="row"
              key={`${source.tableId}-${source.sourceName}-${source.level}`}
            >
              <span
                className={ITEM_DETAILS_CLASS_NAMES.dropSourceExternalCell}
                role="cell"
              >
                <a
                  className={ITEM_DETAILS_CLASS_NAMES.dropSourceLink}
                  href={source.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {source.sourceName}
                  <ExternalLink
                    className={ITEM_DETAILS_CLASS_NAMES.dropSourceLinkIcon}
                    aria-hidden="true"
                  />
                </a>
              </span>
              <span className={ITEM_DETAILS_CLASS_NAMES.dropCell} role="cell">
                {source.category || "Source"}
              </span>
              <span
                className={ITEM_DETAILS_CLASS_NAMES.dropDetailCell}
                role="cell"
              >
                {source.fragment ? "Fragment" : "Item"}
                {source.quantity !== "1" ? ` ×${source.quantity}` : ""}
                {source.level ? ` · Lv ${source.level}` : ""}
                {source.note ? (
                  <small className={ITEM_DETAILS_CLASS_NAMES.dropDetailNote}>
                    {source.note}
                  </small>
                ) : null}
              </span>
              <DropLocationLink
                sourceName={source.sourceName}
                sourceUrl={source.sourceUrl}
                display="location"
              />
            </div>
          ))}
        </div>
      ) : (
        <p className={ITEM_DETAILS_CLASS_NAMES.dropEmpty}>
          No drop location is currently recorded by Avakot.
        </p>
      )}
    </section>
  );
}

function DropLocationLink({
  sourceName,
  sourceUrl,
  display = "source",
}: {
  sourceName: string;
  sourceUrl: string;
  display?: "source" | "location";
}) {
  const mapLocations =
    dropLocationMapBySourceUrl
      .get(sourceUrl)
      ?.locations.filter(
        (location) =>
          location.xPercent !== null && location.yPercent !== null,
      ) ?? [];
  const [selectedLocation, setSelectedLocation] = useState(0);
  const [hoverPoint, setHoverPoint] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lightboxRef = useRef<HTMLElement>(null);
  const lightboxTitleId = useId();
  const dismissLightbox = useCallback(() => setLightboxOpen(false), []);
  const closeLightbox = useMobileHistoryLayer({
    id: "item-drop-location-map",
    isOpen: lightboxOpen,
    onDismiss: dismissLightbox,
  });
  const location = mapLocations[selectedLocation] ?? mapLocations[0];
  const tooltipPosition =
    hoverPoint && typeof window !== "undefined"
      ? {
          left: Math.max(
            12,
            Math.min(hoverPoint.x + 16, window.innerWidth - 332),
          ),
          top:
            hoverPoint.y + 16 + 354 > window.innerHeight
              ? Math.max(12, hoverPoint.y - 366)
              : hoverPoint.y + 16,
        }
      : null;

  useEffect(() => {
    if (!lightboxOpen) return;

    const returnFocusTarget = triggerButtonRef.current;
    const previousOverflow = document.body.style.overflow;
    const focusFrame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus({ preventScroll: true });
    });
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        closeLightbox();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(
        lightboxRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((element) => element.offsetParent !== null);
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        event.stopImmediatePropagation();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        event.stopImmediatePropagation();
        first.focus();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown, true);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = previousOverflow;
      if (returnFocusTarget?.isConnected) {
        returnFocusTarget.focus({ preventScroll: true });
      }
    };
  }, [closeLightbox, lightboxOpen]);

  const updateHoverPoint = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse" || !mapLocations.length) return;
    setHoverPoint({ x: event.clientX, y: event.clientY });
  };
  return (
    <span
      className={
        DROP_LOCATION_CELL_CLASS_NAMES[
          display === "source"
            ? location
              ? "sourceMapped"
              : "sourceUnmapped"
            : location
              ? "locationMapped"
              : "locationUnmapped"
        ]
      }
      role="cell"
      onPointerEnter={updateHoverPoint}
      onPointerMove={updateHoverPoint}
      onPointerLeave={() => setHoverPoint(null)}
    >
      {display === "source" ? (
        <a
          className={ITEM_DETAILS_CLASS_NAMES.dropSourceLink}
          href={sourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          {sourceName}
          <ExternalLink
            className={ITEM_DETAILS_CLASS_NAMES.dropSourceLinkIcon}
            aria-hidden="true"
          />
        </a>
      ) : null}
      {location ? (
        <>
          <button
            ref={triggerButtonRef}
            type="button"
            className={
              DROP_LOCATION_TRIGGER_CLASS_NAMES[
                display === "location"
                  ? lightboxOpen
                    ? "locationActive"
                    : "locationInactive"
                  : lightboxOpen
                    ? "sourceActive"
                    : "sourceInactive"
              ]
            }
            aria-label={`Open ${sourceName} location map`}
            aria-expanded={lightboxOpen}
            onClick={() => {
              setHoverPoint(null);
              setLightboxOpen(true);
            }}
            onFocus={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              setHoverPoint({ x: rect.right, y: rect.bottom });
            }}
            onBlur={() => setHoverPoint(null)}
          >
            {display === "location" ? (
              <span
                className={
                  DROP_LOCATION_MARKER_CLASS_NAMES[
                    lightboxOpen ? "active" : "inactive"
                  ]
                }
                aria-hidden="true"
              >
                <Image
                  className={DROP_LOCATION_TRIGGER_IMAGE_CLASS_NAME}
                  src="/icons/game-ui/map-location.svg"
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes="36px"
                  unoptimized
                />
              </span>
            ) : (
              <Image
                className={DROP_LOCATION_TRIGGER_IMAGE_CLASS_NAME}
                src="/icons/game-ui/map-location.svg"
                alt=""
                aria-hidden="true"
                fill
                sizes="36px"
                unoptimized
              />
            )}
          </button>
          {tooltipPosition && hoverPoint && !lightboxOpen
            ? createPortal(
                <aside
                  className={ITEM_DETAILS_CLASS_NAMES.dropTooltip}
                  role="tooltip"
                  style={
                    {
                      "--item-drop-tooltip-left": `${tooltipPosition.left}px`,
                      "--item-drop-tooltip-top": `${tooltipPosition.top}px`,
                    } as CSSProperties
                  }
                >
                  <header
                    className={ITEM_DETAILS_CLASS_NAMES.dropTooltipHeader}
                  >
                    <span
                      className={ITEM_DETAILS_CLASS_NAMES.dropTooltipEyebrow}
                    >
                      {location.markerName || "Location Map"}
                    </span>
                    <strong
                      className={ITEM_DETAILS_CLASS_NAMES.dropTooltipTitle}
                    >
                      {location.coordinateName || sourceName}
                    </strong>
                  </header>
                  <LocalMapView
                    location={location}
                    sourceName={sourceName}
                    zoom={4.5}
                    appearance="tooltip"
                  />
                  <small className={ITEM_DETAILS_CLASS_NAMES.dropTooltipHint}>
                    Click the marker to expand
                  </small>
                </aside>,
                document.body,
              )
            : null}
          {lightboxOpen
            ? createPortal(
                <div
                  className={ITEM_DETAILS_CLASS_NAMES.dropLightboxBackdrop}
                  role="presentation"
                  onMouseDown={closeLightbox}
                >
                  <section
                    ref={lightboxRef}
                    className={ITEM_DETAILS_CLASS_NAMES.dropLightbox}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={lightboxTitleId}
                    onMouseDown={(event) => event.stopPropagation()}
                  >
                    <header
                      className={ITEM_DETAILS_CLASS_NAMES.dropLightboxHeader}
                    >
                      <div
                        className={
                          ITEM_DETAILS_CLASS_NAMES.dropLightboxHeadingGroup
                        }
                      >
                        <span
                          className={
                            ITEM_DETAILS_CLASS_NAMES.dropLightboxEyebrow
                          }
                        >
                          {location.markerName || "Location Map"}
                        </span>
                        <h2
                          className={
                            ITEM_DETAILS_CLASS_NAMES.dropLightboxTitle
                          }
                          id={lightboxTitleId}
                        >
                          {location.coordinateName || sourceName}
                        </h2>
                      </div>
                      <button
                        ref={closeButtonRef}
                        type="button"
                        className={
                          ITEM_DETAILS_CLASS_NAMES.dropLightboxClose
                        }
                        data-dialog-close
                        aria-label="Close location map"
                        onClick={closeLightbox}
                      >
                        ×
                      </button>
                    </header>
                    <LocalMapView
                      location={location}
                      sourceName={sourceName}
                      zoom={2.4}
                      appearance="lightbox"
                    />
                    <footer
                      className={ITEM_DETAILS_CLASS_NAMES.dropLightboxFooter}
                    >
                      {mapLocations.length > 1 ? (
                        <span
                          className={ITEM_DETAILS_CLASS_NAMES.dropMapPages}
                          aria-label="Map locations"
                        >
                          {mapLocations.map((mapLocation, index) => (
                            <button
                              type="button"
                              className={
                                DROP_MAP_PAGE_CLASS_NAMES[
                                  index === selectedLocation
                                    ? "active"
                                    : "inactive"
                                ]
                              }
                              key={mapLocation.mapUrl}
                              aria-label={`Show location ${index + 1}`}
                              aria-pressed={index === selectedLocation}
                              onClick={() => setSelectedLocation(index)}
                            >
                              {index + 1}
                            </button>
                          ))}
                        </span>
                      ) : (
                        <span
                          className={
                            ITEM_DETAILS_CLASS_NAMES.dropMapPagesPlaceholder
                          }
                        />
                      )}
                      <div
                        className={
                          ITEM_DETAILS_CLASS_NAMES.dropLightboxFooterDetails
                        }
                      >
                        <small
                          className={
                            ITEM_DETAILS_CLASS_NAMES.dropLightboxCoordinates
                          }
                        >
                          {Math.round(location.x ?? 0)},{" "}
                          {Math.round(location.y ?? 0)}
                        </small>
                        <a
                          className={
                            ITEM_DETAILS_CLASS_NAMES.dropLightboxSourceLink
                          }
                          href={location.mapUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View source map
                          <ExternalLink
                            className={
                              ITEM_DETAILS_CLASS_NAMES
                                .dropLightboxSourceLinkIcon
                            }
                            aria-hidden="true"
                          />
                        </a>
                      </div>
                    </footer>
                  </section>
                </div>,
                document.body,
              )
            : null}
        </>
      ) : display === "location" ? (
        <span
          className={ITEM_DETAILS_CLASS_NAMES.dropLocationUnmapped}
          aria-label="No mapped location"
        >
          —
        </span>
      ) : null}
    </span>
  );
}

function getDropMarkerIcon(location: DropLocationMap, sourceName: string) {
  if (sourceName.toLowerCase().includes("cogah")) {
    return dropLocationMapCuratedIcons.cogah;
  }
  return location.markerIconUrl || dropLocationMapCuratedIcons.agari;
}

function DropMarkerIcon({
  location,
  sourceName,
  appearance,
}: {
  location: DropLocationMap;
  sourceName: string;
  appearance: "trigger" | "pin";
}) {
  return (
    <Image
      className={DROP_MARKER_IMAGE_CLASS_NAMES[appearance]}
      src={getDropMarkerIcon(location, sourceName)}
      alt=""
      fill
      sizes="32px"
    />
  );
}

function LocalMapView({
  location,
  sourceName,
  zoom,
  appearance,
}: {
  location: DropLocationMap;
  sourceName: string;
  zoom: number;
  appearance: LocalMapAppearance;
}) {
  const x = (location.xPercent ?? 50) / 100;
  const y = (location.yPercent ?? 50) / 100;
  const canvasSize = zoom * 100;
  const left = Math.min(0, Math.max(100 - canvasSize, 50 - x * canvasSize));
  const top = Math.min(0, Math.max(100 - canvasSize, 50 - y * canvasSize));

  return (
    <div className={LOCAL_MAP_FRAME_CLASS_NAMES[appearance]}>
      <div
        className={ITEM_DETAILS_CLASS_NAMES.dropMapCanvas}
        style={
          {
            "--item-drop-map-canvas-left": `${left}%`,
            "--item-drop-map-canvas-size": `${canvasSize}%`,
            "--item-drop-map-canvas-top": `${top}%`,
          } as CSSProperties
        }
      >
        <Image
          className={ITEM_DETAILS_CLASS_NAMES.dropMapImage}
          src={dropLocationMapAsset}
          alt=""
          fill
          sizes={appearance === "lightbox" ? "900px" : "480px"}
        />
        <span
          className={ITEM_DETAILS_CLASS_NAMES.dropMapPin}
          style={
            {
              "--item-drop-map-pin-x": `${location.xPercent}%`,
              "--item-drop-map-pin-y": `${location.yPercent}%`,
            } as CSSProperties
          }
          aria-label={location.coordinateName || sourceName}
        >
          <DropMarkerIcon
            location={location}
            sourceName={sourceName}
            appearance="pin"
          />
        </span>
      </div>
    </div>
  );
}

export function ItemStatDetails({
  contribution,
  comparison,
}: {
  contribution: ItemContribution;
  comparison?: ItemContribution;
}) {
  return (
    <div className={ITEM_DETAILS_CLASS_NAMES.itemStatTable}>
      <div className={ITEM_DETAILS_CLASS_NAMES.itemStatHead}>
        <span className={ITEM_DETAILS_CLASS_NAMES.itemStatHeadName}>
          Defense
        </span>
        <span>Base</span>
        <span>Virtue</span>
        <span>Final</span>
        {comparison ? <span>Δ</span> : null}
      </div>
      {DEFENSE_IDS.map((defense) => {
        const result = contribution.defenses[defense];
        const delta = comparison
          ? result.total - comparison.defenses[defense].total
          : undefined;
        return (
          <div
            className={ITEM_DETAILS_CLASS_NAMES.itemStatRow}
            key={defense}
          >
            <span className={ITEM_DETAILS_CLASS_NAMES.itemStatName}>
              <StatIcon
                src={defenseMeta[defense].icon}
                label={defenseMeta[defense].label}
                size="small"
              />
              <span className={ITEM_DETAILS_CLASS_NAMES.itemStatNameLabel}>
                {defenseMeta[defense].shortLabel}
              </span>
            </span>
            <span className={ITEM_DETAILS_CLASS_NAMES.itemStatValue}>
              {result.base}
            </span>
            <span className={ITEM_DETAILS_CLASS_NAMES.itemStatValue}>
              +{result.scaling}
            </span>
            <strong className={ITEM_DETAILS_CLASS_NAMES.itemStatValue}>
              {result.total}
            </strong>
            {delta !== undefined ? (
              <span
                className={
                  ITEM_STAT_DELTA_CLASS_NAMES[
                    delta > 0
                      ? "positive"
                      : delta < 0
                        ? "negative"
                        : "neutral"
                  ]
                }
              >
                {formatDelta(delta)}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
