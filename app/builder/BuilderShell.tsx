"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { armorById, armorCatalogue } from "@/src/data/catalogue";
import { talismanCatalogue } from "@/src/data/talismans";
import { weaponById, weaponCatalogue } from "@/src/data/weapons";
import { pactById, pactCatalogue } from "@/src/data/pacts";
import { runeById, runeCatalogue } from "@/src/data/runes";
import { totemCatalogue } from "@/src/data/totems";
import { combatArtByName, pactArtTreeByPactId } from "@/src/data/arts";
import { calculateBuild } from "@/src/domain/calculation";
import {
  LEGACY_STORAGE_KEYS,
  STORAGE_KEY,
  deserializeBuild,
  parseStoredBuild,
  serializeBuild,
} from "@/src/domain/serialization";
import { distributeVirtueTotal } from "@/src/domain/virtue-alignment";
import { getAllocatableAffinity } from "@/src/domain/affinity";
import {
  optimizeAffinityForArmor,
  optimizeArmorForAffinity,
} from "@/src/domain/optimization";
import {
  createEmptyWeaponEnhancements,
  normalizeWeaponEnhancements,
} from "@/src/domain/enchantments";
import {
  createDefaultCombatArtAllocation,
  createDefaultPactArtAllocation,
  getPactVirtueArtRanks,
  normalizeCombatArtAllocation,
  normalizePactArtAllocation,
} from "@/src/domain/arts";
import {
  DEFENSE_IDS,
  VIRTUE_IDS,
  type AffinitySources,
  type ArtAllocation,
  type DefenseId,
  type EquipmentSlot,
  type SoulframeBuild,
  type VirtueValues,
} from "@/src/domain/types";
import { DEFAULT_BUILD, defenseMeta, virtueMeta } from "./constants";
import {
  MOBILE_DEFENSE_LABEL_CLASS_NAMES,
  MOBILE_DEFENSE_SHORT_LABEL_CLASS_NAMES,
} from "./components/accessibilityClassNames";
import {
  BUILDER_SHELL_CLASS_NAMES,
  FOOTER_CLASS_NAMES,
  SECONDARY_MODIFIER_CLASS_NAMES,
  WORKSPACE_HEADING_CLASS_NAMES,
} from "./components/builderShellClassNames";
import { MOBILE_TOP_HEADER_MENU_SHELL_CLASS_NAME } from "./components/mobileHeaderClassNames";
import {
  MOBILE_BUILD_DAMAGE_CLASS_NAMES,
  MOBILE_BUILD_DAMAGE_PANELS_CLASS_NAMES,
  MOBILE_DEFENSE_CREST_CLASS_NAMES,
  MOBILE_DEFENSE_BACKDROP_CLASS_NAME,
  MOBILE_DEFENSE_FILIGREE_CLASS_NAMES,
  MOBILE_DEFENSE_HUD_CLASS_NAMES,
  MOBILE_DEFENSE_LAYER_CLASS_NAMES,
  MOBILE_DEFENSE_PLAQUE_CLASS_NAMES,
  MOBILE_DEFENSE_PLAQUE_DECORATION_CLASS_NAMES,
  MOBILE_DEFENSE_STAT_CLASS_NAMES,
  MOBILE_DEFENSE_STAT_CONTEXT_ACTIVE_CLASS_NAME,
  MOBILE_DEFENSE_STAT_CONTEXT_CLASS_NAME,
  MOBILE_DEFENSE_STAT_CONTEXT_COPY_CLASS_NAME,
  MOBILE_DEFENSE_STAT_CONTEXT_TITLE_CLASS_NAME,
  MOBILE_DEFENSE_STAT_INFO_GLYPH_CLASS_NAME,
  MOBILE_DEFENSE_STAT_INFO_CLASS_NAME,
  MOBILE_DEFENSE_STAT_IMAGE_CLASS_NAMES,
  MOBILE_DEFENSE_STAT_VALUE_CLASS_NAMES,
  MOBILE_DEFENSE_TOTAL_CLASS_NAMES,
  MOBILE_DEFENSE_TOTAL_LABEL_CLASS_NAMES,
  MOBILE_STATS_DOCK_CLASS_NAMES,
  MOBILE_STATS_COMPACT_CLASS_NAMES,
  MOBILE_STATS_COMPACT_CREST_CLASS_NAME,
  MOBILE_STATS_COMPACT_CREST_LAYER_CLASS_NAME,
  MOBILE_STATS_COMPACT_DEFENSE_CLASS_NAME,
  MOBILE_STATS_COMPACT_DEFENSE_ITEM_CLASS_NAME,
  MOBILE_STATS_COMPACT_DEFENSE_VALUES_CLASS_NAME,
  MOBILE_STATS_COMPACT_GROUP_CLASS_NAME,
  MOBILE_STATS_COMPACT_GROUP_LABEL_CLASS_NAME,
  MOBILE_STATS_COMPACT_METRIC_CLASS_NAME,
  MOBILE_STATS_COMPACT_METRIC_LABEL_CLASS_NAME,
  MOBILE_STATS_COMPACT_METRICS_CLASS_NAME,
  MOBILE_STATS_COMPACT_METRIC_VALUE_CLASS_NAME,
  MOBILE_STATS_COMPACT_TOTAL_CLASS_NAME,
  MOBILE_STATS_EXPANDED_CONTENT_CLASS_NAMES,
  MOBILE_STATS_HEADING_DIVIDER_CLASS_NAME,
  MOBILE_STATS_HEADING_CLASS_NAMES,
  MOBILE_STATS_PANEL_CLASS_NAMES,
  MOBILE_STATS_RAIL_CLASS_NAMES,
  MOBILE_STATS_SUMMARY_CLASS_NAMES,
  MOBILE_STATS_TITLE_CLASS_NAMES,
  MOBILE_STATS_TITLE_HEADING_CLASS_NAMES,
  MOBILE_STATS_TRIGGER_CLASS_NAMES,
  MOBILE_STATS_TRIGGER_ICON_CLASS_NAMES,
  MOBILE_STATS_TRIGGER_ICON_SHELL_CLASS_NAMES,
  MOBILE_SECONDARY_MODIFIERS_CLASS_NAMES,
  MOBILE_WORKSPACE_SCRIM_CLASS_NAMES,
} from "./components/mobileWorkspaceClassNames";
import { VirtuesAffinityModule } from "./affinity/VirtuesAffinityModule";
import {
  ArmorTalismanEquipmentModule,
  isArmorTalismanSlot,
  updateArmorTalismanEquipment,
} from "./loadout/ArmorTalismanEquipmentModule";
import { PactArtsModule } from "./loadout/PactArtsModule";
import {
  OptimizationLightbox as BuilderOptimizationLightbox,
  type OptimizationResult,
} from "./optimization/OptimizationLightbox";
import { MobileSupportZone } from "./support/MobileSupportZone";
import { WeaponEquipmentModule } from "./loadout/WeaponEquipmentModule";
import { WeaponEnhancementsModule } from "./loadout/WeaponEnhancementsModule";
import { ActiveBuildEffects } from "./stats/ActiveBuildEffects";
import { WeaponDamagePanel } from "./stats/WeaponDamagePanel";
import {
  getWeaponDamageRows,
  meetsWeaponRequirements,
} from "./lib/weapon-damage";
import { useMobileWorkspace } from "./hooks/useMobileWorkspace";
import { BuilderHeader } from "./header/BuilderHeader";
import { BuildNameControl } from "./header/BuildNameControl";
import { MobileHeaderDrawer } from "./header/MobileHeaderDrawer";
import { useAlerts } from "../alerts/AlertsProvider";
import { useMobileHistoryLayer } from "../hooks/useMobileHistoryLayer";
import { useSoulframeShell } from "../soulframe/components/SoulframeShellContext";
import { ArtifactControls } from "@/src/features/artifacts/ArtifactControls";

const UNMET_GEAR_ALERT_ID = "builder.unmet-gear-requirements";
const PACT_ART_LIBRARY_KEY = "soulframe-framer.pact-arts.v1";
const COMBAT_ART_LIBRARY_KEY = "soulframe-framer.combat-arts.v1";

type ArtLibrary = Record<string, ArtAllocation>;

type DefenseContextPosition = {
  left: number;
  top: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parsePactArtLibrary(value: string | null): ArtLibrary {
  if (!value) return {};
  try {
    const parsed: unknown = JSON.parse(value);
    if (!isRecord(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed).flatMap(([pactId, allocation]) => {
        const pact = pactById.get(pactId);
        if (!pact || !pactArtTreeByPactId.has(pactId)) return [];
        return [[pactId, normalizePactArtAllocation(pact, allocation).value]];
      }),
    );
  } catch {
    return {};
  }
}

function parseCombatArtLibrary(value: string | null): ArtLibrary {
  if (!value) return {};
  try {
    const parsed: unknown = JSON.parse(value);
    if (!isRecord(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed).flatMap(([artName, allocation]) =>
        combatArtByName.has(artName)
          ? [[artName, normalizeCombatArtAllocation(artName, allocation).value]]
          : [],
      ),
    );
  } catch {
    return {};
  }
}

function getActiveCombatArtNames(build: SoulframeBuild) {
  return [
    ...new Set(
      (["mainHand", "offHand"] as const).flatMap((slot) => {
        const itemId = build.equipment[slot];
        const artName = itemId ? weaponById.get(itemId)?.combatArt : undefined;
        return artName && combatArtByName.has(artName) ? [artName] : [];
      }),
    ),
  ];
}

function hydrateActiveArts(
  build: SoulframeBuild,
  pactLibrary: ArtLibrary,
  combatLibrary: ArtLibrary,
  sourceSchemaVersion?: 1 | 2 | 3 | 4 | 5,
): SoulframeBuild {
  const pact = build.pact.itemId ? pactById.get(build.pact.itemId) : undefined;
  const hasExplicitV5Arts = sourceSchemaVersion === 5;
  const hasExplicitV4PactArts = sourceSchemaVersion === 4 && Boolean(pact);
  const artAllocation = pact
    ? normalizePactArtAllocation(
        pact,
        hasExplicitV5Arts || hasExplicitV4PactArts
          ? build.pact.artAllocation
          : (pactLibrary[pact.id] ??
              (Object.keys(build.pact.artAllocation).length
                ? build.pact.artAllocation
                : createDefaultPactArtAllocation(pact))),
      ).value
    : {};
  const combatArts = Object.fromEntries(
    getActiveCombatArtNames(build).map((artName) => [
      artName,
      normalizeCombatArtAllocation(
        artName,
        hasExplicitV5Arts
          ? (build.combatArts[artName] ?? createDefaultCombatArtAllocation())
          : (combatLibrary[artName] ?? createDefaultCombatArtAllocation()),
      ).value,
    ]),
  );
  return {
    ...build,
    affinitySources: {
      ...build.affinitySources,
      pactArts: pact
        ? getPactVirtueArtRanks(pact.id, artAllocation)
        : build.affinitySources.pactArts,
    },
    pact: { itemId: pact?.id ?? null, artAllocation },
    combatArts,
  };
}

function withPactArtAllocation(
  build: SoulframeBuild,
  pactId: string | null,
  artAllocation: ArtAllocation,
): SoulframeBuild {
  return {
    ...build,
    affinitySources: {
      ...build.affinitySources,
      pactArts: getPactVirtueArtRanks(pactId, artAllocation),
    },
    pact: { itemId: pactId, artAllocation },
  };
}

function withActiveCombatArts(
  build: SoulframeBuild,
  remembered: ArtLibrary,
): SoulframeBuild {
  return {
    ...build,
    combatArts: Object.fromEntries(
      getActiveCombatArtNames(build).map((artName) => [
        artName,
        build.combatArts[artName] ??
          remembered[artName] ??
          createDefaultCombatArtAllocation(),
      ]),
    ),
  };
}

const MOBILE_DEFENSE_SHORT_LABELS = {
  physicalDefense: "PHYS",
  magickDefense: "MAG",
  stabilityIncrease: "STAB",
} as const satisfies Record<(typeof DEFENSE_IDS)[number], string>;

const DEFENSE_CONTEXT_COPY: Record<DefenseId, string> = {
  physicalDefense: "Helps reduce incoming physical damage.",
  magickDefense: "Helps reduce incoming Magick damage.",
  stabilityIncrease: "Helps reduce stagger buildup and resist knockdowns.",
};

export function BuilderShell({
  artifactOwnerId,
}: {
  artifactOwnerId: string | null;
}) {
  const { registerAiAction } = useSoulframeShell();
  const {
    closeAlertCenter,
    isCenterOpen,
    mobileHeaderLayerElement,
    notifyAlert,
    syncAlert,
  } = useAlerts();
  const [build, setBuild] = useState<SoulframeBuild>(DEFAULT_BUILD);
  const [pactArtLibrary, setPactArtLibrary] = useState<ArtLibrary>({});
  const [combatArtLibrary, setCombatArtLibrary] = useState<ArtLibrary>({});
  const [activeSlot, setActiveSlot] = useState<EquipmentSlot>();
  const [isPactPickerOpen, setIsPactPickerOpen] = useState(false);
  const [weaponConfigTab, setWeaponConfigTab] = useState<
    "weapon" | "arts" | "rune" | "totems"
  >("weapon");
  const [selectedTotemSlot, setSelectedTotemSlot] = useState(0);
  const [activeDefenseContext, setActiveDefenseContext] = useState<DefenseId>();
  const [defenseContextPosition, setDefenseContextPosition] =
    useState<DefenseContextPosition>();
  const defenseContextTriggerRefs = useRef(
    new Map<DefenseId, HTMLButtonElement>(),
  );
  const defenseContextPopoverRef = useRef<HTMLDivElement>(null);
  const defensePointerDownWasActiveRef = useRef(false);
  const [isActiveBuildEffectsOpen, setIsActiveBuildEffectsOpen] =
    useState(false);
  const mobileStatsScrollTopBeforeEffectsRef = useRef(0);
  const [optimizationMode, setOptimizationMode] = useState<
    "choose" | "affinity" | "armor"
  >();
  const isBuilderModalLayerOpen =
    Boolean(activeSlot) || isPactPickerOpen || optimizationMode !== undefined;
  const isOptimizationOpen = optimizationMode !== undefined;

  const dismissBuilderModalLayer = useCallback(() => {
    setActiveSlot(undefined);
    setIsPactPickerOpen(false);
    setOptimizationMode(undefined);
  }, []);
  const closeBuilderModalLayer = useMobileHistoryLayer({
    id: "builder-modal-layer",
    isOpen: isBuilderModalLayerOpen,
    onDismiss: dismissBuilderModalLayer,
  });
  const isMobileShellSuppressed = Boolean(activeSlot) || isPactPickerOpen;
  const {
    isMobileViewport,
    isMobileMenuAvailable,
    isMobileMenuOpen,
    toggleMobileMenu,
    isMobileStatsExpanded,
    mobileStatsPresentationState,
    toggleMobileStats,
    closeMobileWorkspaceOverlay,
    mobileTopMenuTriggerRef,
    mobileMenuLayerRef,
    mobileMenuLayerElement,
    activeMobileMenuTriggerRef,
    mobileMenuPanelRef,
    mobileMenuCloseRef,
    mobileStatsDockRef,
    mobileStatsTriggerRef,
    mobileStatsPanelRef,
    mobileStatsRailRef,
  } = useMobileWorkspace(build, isMobileShellSuppressed);
  const [hydrated, setHydrated] = useState(false);
  const mobileStatsGeometryState =
    mobileStatsPresentationState === "collapsed" ? "collapsed" : "expanded";
  const mobileStatsDetailState =
    mobileStatsPresentationState === "collapsed" ? "collapsed" : "expanded";
  const showDefenseContext = useCallback((defense: DefenseId) => {
    setActiveDefenseContext(defense);
  }, []);
  const hideDefenseContext = useCallback(() => {
    setActiveDefenseContext(undefined);
  }, []);
  const handleActiveBuildEffectsOpenChange = useCallback(
    (isOpen: boolean) => {
      const panel = mobileStatsPanelRef.current;
      if (isOpen) {
        mobileStatsScrollTopBeforeEffectsRef.current = panel?.scrollTop ?? 0;
        setIsActiveBuildEffectsOpen(true);
        return;
      }

      setIsActiveBuildEffectsOpen(false);
      window.requestAnimationFrame(() => {
        if (mobileStatsPanelRef.current) {
          mobileStatsPanelRef.current.scrollTop =
            mobileStatsScrollTopBeforeEffectsRef.current;
        }
      });
    },
    [mobileStatsPanelRef],
  );

  useEffect(() => {
    if (!isMobileViewport || isMobileStatsExpanded) return;
    const timer = window.setTimeout(hideDefenseContext, 0);
    return () => window.clearTimeout(timer);
  }, [hideDefenseContext, isMobileStatsExpanded, isMobileViewport]);

  useEffect(() => {
    if (!activeDefenseContext) return;

    const dismissOnPointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Node)) return;
      const trigger =
        defenseContextTriggerRefs.current.get(activeDefenseContext);
      if (
        trigger?.contains(event.target) ||
        defenseContextPopoverRef.current?.contains(event.target)
      ) {
        return;
      }
      hideDefenseContext();
    };
    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      hideDefenseContext();
    };

    document.addEventListener("pointerdown", dismissOnPointerDown);
    document.addEventListener("keydown", dismissOnEscape);
    return () => {
      document.removeEventListener("pointerdown", dismissOnPointerDown);
      document.removeEventListener("keydown", dismissOnEscape);
    };
  }, [activeDefenseContext, hideDefenseContext]);

  useEffect(() => {
    if (!activeDefenseContext || !hydrated) return;

    const updatePosition = () => {
      const trigger =
        defenseContextTriggerRefs.current.get(activeDefenseContext);
      const popover = defenseContextPopoverRef.current;
      if (!trigger || !popover) return;

      const margin = 12;
      const gap = 8;
      const triggerRect = trigger.getBoundingClientRect();
      const popoverRect = popover.getBoundingClientRect();
      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = window.innerHeight;
      const centeredLeft =
        triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2;
      const left = Math.min(
        Math.max(centeredLeft, margin),
        Math.max(margin, viewportWidth - popoverRect.width - margin),
      );
      const below = triggerRect.bottom + gap;
      const above = triggerRect.top - popoverRect.height - gap;
      const top =
        below + popoverRect.height <= viewportHeight - margin || above < margin
          ? Math.min(below, viewportHeight - popoverRect.height - margin)
          : above;

      setDefenseContextPosition({ left, top: Math.max(margin, top) });
    };

    updatePosition();
    const resizeObserver = new ResizeObserver(updatePosition);
    resizeObserver.observe(defenseContextPopoverRef.current!);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [activeDefenseContext, hydrated]);
  const calculation = useMemo(
    () => calculateBuild(build, armorCatalogue, talismanCatalogue),
    [build],
  );
  const optimizationResult = useMemo<OptimizationResult | undefined>(() => {
    if (optimizationMode === "affinity") {
      return optimizeAffinityForArmor(build, armorCatalogue, talismanCatalogue);
    }
    if (optimizationMode === "armor") {
      return optimizeArmorForAffinity(build, armorCatalogue, talismanCatalogue);
    }
    return undefined;
  }, [build, optimizationMode]);
  const unmetArmorItems = calculation.items.flatMap((contribution) => {
    if (contribution.requirementMet) return [];
    const item = armorById.get(contribution.itemId);
    return item ? [item] : [];
  });
  const unmetWeaponItems = (["mainHand", "offHand"] as const).flatMap(
    (slot) => {
      const itemId = build.equipment[slot];
      const item = itemId ? weaponById.get(itemId) : undefined;
      return item &&
        !meetsWeaponRequirements(item, calculation.effectiveVirtues)
        ? [item]
        : [];
    },
  );
  const unmetRequirementCount =
    unmetArmorItems.length + unmetWeaponItems.length;
  const mobileMainHandDamage = getWeaponDamageRows(
    build.equipment.mainHand
      ? weaponById.get(build.equipment.mainHand)
      : undefined,
    calculation.effectiveVirtues,
  );
  const mobileOffHandDamage = getWeaponDamageRows(
    build.equipment.offHand
      ? weaponById.get(build.equipment.offHand)
      : undefined,
    calculation.effectiveVirtues,
  );
  const mobileMainHandAttack =
    mobileMainHandDamage.find((stat) => stat.id === "attack")?.value ?? "—";
  const mobileMainHandCharged =
    mobileMainHandDamage.find((stat) => stat.id === "charged")?.value ?? "—";
  const mobileOffHandAttack =
    mobileOffHandDamage.find((stat) => stat.id === "attack")?.value ?? "—";
  const mobileOffHandCharged =
    mobileOffHandDamage.find((stat) => stat.id === "charged")?.value ?? "—";
  const unmetRequirementGroups = VIRTUE_IDS.flatMap((virtue) => {
    const armorRequirements = unmetArmorItems.flatMap((item) =>
      item.requirement?.virtue === virtue ? [item.requirement.value] : [],
    );
    const weaponRequirements = unmetWeaponItems.flatMap((item) => {
      const required = item.requirements[virtue];
      return calculation.effectiveVirtues[virtue] < required ? [required] : [];
    });
    const requirements = [...armorRequirements, ...weaponRequirements];
    if (!requirements.length) return [];

    return [
      {
        virtue,
        itemCount: requirements.length,
        required: Math.max(...requirements),
      },
    ];
  });
  const unmetRequirementDescription = unmetRequirementGroups
    .map(
      (group) =>
        `${virtueMeta[group.virtue].label} ${calculation.effectiveVirtues[group.virtue]}/${group.required} · ${group.itemCount} item${group.itemCount === 1 ? "" : "s"} base-only`,
    )
    .join(". ");
  const unmetRequirementImpact =
    unmetRequirementCount * 1000 +
    unmetRequirementGroups.reduce(
      (total, group) =>
        total +
        Math.max(
          0,
          group.required - calculation.effectiveVirtues[group.virtue],
        ),
      0,
    );
  useEffect(() => {
    let nextBuild: SoulframeBuild | undefined;
    let nextSourceSchemaVersion: 1 | 2 | 3 | 4 | 5 | undefined;
    const rememberedPactArts = parsePactArtLibrary(
      window.localStorage.getItem(PACT_ART_LIBRARY_KEY),
    );
    const rememberedCombatArts = parseCombatArtLibrary(
      window.localStorage.getItem(COMBAT_ART_LIBRARY_KEY),
    );
    let nextNotice:
      | {
          title: string;
          description: string;
          severity: "info" | "warning" | "danger";
        }
      | undefined;
    const shared = new URLSearchParams(window.location.search).get("build");
    if (shared) {
      const result = deserializeBuild(shared, {
        armor: armorCatalogue,
        talismans: talismanCatalogue,
        weapons: weaponCatalogue,
        pacts: pactCatalogue,
        runes: runeCatalogue,
        totems: totemCatalogue,
      });
      if (result.ok) {
        nextBuild = result.build;
        nextSourceSchemaVersion = result.sourceSchemaVersion;
        nextNotice = {
          title: "Shared build loaded",
          description: result.warnings.length
            ? `Shared build loaded. ${result.warnings.join(" ")}`
            : "Shared build loaded.",
          severity: result.warnings.length ? "warning" : "info",
        };
      } else {
        nextNotice = {
          title: "Shared build unavailable",
          description: `Shared build could not be loaded. ${result.error}`,
          severity: "danger",
        };
      }
    } else {
      const stored =
        window.localStorage.getItem(STORAGE_KEY) ??
        LEGACY_STORAGE_KEYS.map((key) => window.localStorage.getItem(key)).find(
          (value) => value !== null,
        );
      if (stored) {
        const result = parseStoredBuild(stored, {
          armor: armorCatalogue,
          talismans: talismanCatalogue,
          weapons: weaponCatalogue,
          pacts: pactCatalogue,
          runes: runeCatalogue,
          totems: totemCatalogue,
        });
        if (result.ok) {
          nextBuild = result.build;
          nextSourceSchemaVersion = result.sourceSchemaVersion;
          if (result.warnings.length) {
            nextNotice = {
              title: "Saved build adjusted",
              description: result.warnings.join(" "),
              severity: "warning",
            };
          }
        } else {
          nextNotice = {
            title: "Default build restored",
            description:
              "Saved build was invalid, so the default build was restored.",
            severity: "danger",
          };
        }
      }
    }

    const resolvedBuild = hydrateActiveArts(
      nextBuild ?? DEFAULT_BUILD,
      rememberedPactArts,
      rememberedCombatArts,
      nextSourceSchemaVersion,
    );
    const nextPactLibrary = { ...rememberedPactArts };
    if (resolvedBuild.pact.itemId) {
      nextPactLibrary[resolvedBuild.pact.itemId] =
        resolvedBuild.pact.artAllocation;
    }
    const nextCombatLibrary = {
      ...rememberedCombatArts,
      ...resolvedBuild.combatArts,
    };

    const timer = window.setTimeout(() => {
      setBuild(resolvedBuild);
      setPactArtLibrary(nextPactLibrary);
      setCombatArtLibrary(nextCombatLibrary);
      if (nextNotice) {
        notifyAlert({
          id: "builder.load",
          ...nextNotice,
        });
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [notifyAlert]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(build));
    for (const key of LEGACY_STORAGE_KEYS) {
      window.localStorage.removeItem(key);
    }
  }, [build, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(
      PACT_ART_LIBRARY_KEY,
      JSON.stringify(pactArtLibrary),
    );
  }, [hydrated, pactArtLibrary]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(
      COMBAT_ART_LIBRARY_KEY,
      JSON.stringify(combatArtLibrary),
    );
  }, [combatArtLibrary, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    syncAlert({
      id: UNMET_GEAR_ALERT_ID,
      title: "Gear requirements unmet",
      description:
        unmetRequirementDescription ||
        "One or more equipped items have unmet requirements.",
      severity: "warning",
      active: unmetRequirementCount > 0,
      impact: unmetRequirementImpact,
    });
  }, [
    hydrated,
    syncAlert,
    unmetRequirementCount,
    unmetRequirementDescription,
    unmetRequirementImpact,
  ]);

  const updateVirtues = (virtues: VirtueValues) => {
    setBuild((current) => ({
      ...current,
      virtues: distributeVirtueTotal(
        getAllocatableAffinity(current.affinitySources),
        virtues,
      ),
    }));
  };

  const updateAffinitySources = (affinitySources: AffinitySources) => {
    setBuild((current) => ({
      ...current,
      affinitySources: {
        ...affinitySources,
        pactArts: getPactVirtueArtRanks(
          current.pact.itemId,
          current.pact.artAllocation,
        ),
      },
      virtues: distributeVirtueTotal(
        getAllocatableAffinity(affinitySources),
        current.virtues,
      ),
    }));
  };

  const updatePactArtAllocation = (
    pactId: string,
    allocation: ArtAllocation,
  ) => {
    const pact = pactById.get(pactId);
    if (!pact) return;
    const normalized = normalizePactArtAllocation(pact, allocation).value;
    setPactArtLibrary((current) => ({ ...current, [pactId]: normalized }));
    if (build.pact.itemId === pactId) {
      setBuild((current) => withPactArtAllocation(current, pactId, normalized));
    }
  };

  const equipPact = (pactId: string) => {
    const pact = pactById.get(pactId);
    if (!pact) return;
    const remembered = { ...pactArtLibrary };
    if (build.pact.itemId) {
      remembered[build.pact.itemId] = build.pact.artAllocation;
    }
    const allocation = normalizePactArtAllocation(
      pact,
      remembered[pactId] ?? createDefaultPactArtAllocation(pact),
    ).value;
    setPactArtLibrary({ ...remembered, [pactId]: allocation });
    setBuild((current) => withPactArtAllocation(current, pactId, allocation));
  };

  const resetPactArtAllocation = (pactId: string) => {
    const pact = pactById.get(pactId);
    if (!pact) return;
    updatePactArtAllocation(pactId, createDefaultPactArtAllocation(pact));
  };

  const updateCombatArtAllocation = (
    artName: string,
    allocation: ArtAllocation,
  ) => {
    const normalized = normalizeCombatArtAllocation(artName, allocation).value;
    setCombatArtLibrary((current) => ({
      ...current,
      [artName]: normalized,
    }));
    setBuild((current) =>
      artName in current.combatArts
        ? {
            ...current,
            combatArts: { ...current.combatArts, [artName]: normalized },
          }
        : current,
    );
  };

  const equipWeapon = (
    slot: "mainHand" | "offHand",
    itemId: string,
    enhancements: SoulframeBuild["weaponEnhancements"][typeof slot],
  ) => {
    const remembered = { ...combatArtLibrary, ...build.combatArts };
    setCombatArtLibrary(remembered);
    setBuild((current) =>
      withActiveCombatArts(
        {
          ...current,
          equipment: { ...current.equipment, [slot]: itemId },
          weaponEnhancements: {
            ...current.weaponEnhancements,
            [slot]: enhancements,
          },
        },
        remembered,
      ),
    );
  };

  const shareBuild = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set("build", serializeBuild(build));
    try {
      await navigator.clipboard.writeText(url.toString());
      notifyAlert({
        id: "builder.share",
        title: "Frame link ready",
        description: "Frame link copied to your clipboard.",
        severity: "info",
      });
    } catch {
      window.history.replaceState(window.history.state, "", url);
      notifyAlert({
        id: "builder.share",
        title: "Frame link ready",
        description: "Frame link added to the address bar.",
        severity: "info",
      });
    }
  };

  const resetBuild = () => {
    setBuild(
      hydrateActiveArts(DEFAULT_BUILD, pactArtLibrary, combatArtLibrary),
    );
    notifyAlert({
      id: "builder.reset",
      title: "Default build restored",
      description: "Default build restored.",
      severity: "info",
    });
  };

  const toggleBuilderMenu = useCallback(
    (opener: HTMLButtonElement) => {
      if (!isMobileMenuOpen) {
        closeAlertCenter();
        setOptimizationMode(undefined);
      }
      toggleMobileMenu(opener);
    },
    [closeAlertCenter, isMobileMenuOpen, toggleMobileMenu],
  );

  const openOptimization = useCallback(() => {
    closeAlertCenter();
    if (isMobileMenuOpen) closeMobileWorkspaceOverlay();
    setOptimizationMode("choose");
  }, [closeAlertCenter, closeMobileWorkspaceOverlay, isMobileMenuOpen]);

  useEffect(
    () =>
      registerAiAction({
        label: isOptimizationOpen
          ? "Close build optimization"
          : "Optimize this Frame",
        isActive: isOptimizationOpen,
        onToggle: isOptimizationOpen
          ? closeBuilderModalLayer
          : openOptimization,
        onDismiss: () => {
          if (isOptimizationOpen) closeBuilderModalLayer();
        },
      }),
    [
      closeBuilderModalLayer,
      isOptimizationOpen,
      openOptimization,
      registerAiAction,
    ],
  );

  useEffect(() => {
    if (!isCenterOpen) return;
    const timer = window.setTimeout(() => {
      if (isMobileMenuOpen) closeMobileWorkspaceOverlay();
      if (isOptimizationOpen) setOptimizationMode(undefined);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [
    closeMobileWorkspaceOverlay,
    isCenterOpen,
    isMobileMenuOpen,
    isOptimizationOpen,
  ]);

  const publisherHref = `/soulframe/publisher/builds/new?${new URLSearchParams({ frame: serializeBuild(build) })}`;

  return (
    <main className={BUILDER_SHELL_CLASS_NAMES.app}>
      {!artifactOwnerId ? (
        <BuilderHeader
          buildName={build.name}
          isMobileMenuAvailable={isMobileMenuAvailable}
          isMobileMenuOpen={isMobileMenuOpen}
          isMobileSuppressed={isMobileShellSuppressed}
          mobileMenuTriggerRef={mobileTopMenuTriggerRef}
          mobileMenuLayerRef={mobileMenuLayerRef}
          onNameChange={(name) => setBuild((current) => ({ ...current, name }))}
          onToggleMobileMenu={toggleBuilderMenu}
        />
      ) : null}
      {hydrated && !artifactOwnerId ? (
        <div
          className={`relative z-30 mt-2 flex min-h-12 items-center justify-end border-b border-line/45 px-1.5 pb-2 ${isMobileShellSuppressed ? "max-tablet:hidden" : ""}`}
        >
          <Link
            href={publisherHref}
            className="inline-flex min-h-11 items-center justify-center border border-gold bg-control-hover px-4 font-sans text-2xs font-bold uppercase tracking-wide text-gold-bright no-underline shadow-control-active focus-visible:outline-none focus-visible:shadow-focus"
            aria-label="Publish the active Frame as a Build"
          >
            Publish Build
          </Link>
        </div>
      ) : null}
      {artifactOwnerId && hydrated ? (
        <ArtifactControls
          ownerId={artifactOwnerId}
          build={build}
          isMobileSuppressed={isMobileShellSuppressed}
          publishHref={publisherHref}
          onNameChange={(name) => setBuild((current) => ({ ...current, name }))}
          onReplaceBuild={setBuild}
          onReset={resetBuild}
          onShare={shareBuild}
        />
      ) : null}
      {!artifactOwnerId ? (
        <MobileHeaderDrawer
          buildName={build.name}
          isMenuAvailable={isMobileMenuAvailable}
          isDrawerOpen={isMobileMenuOpen}
          isSuppressed={isMobileShellSuppressed}
          menuLayerElement={mobileMenuLayerElement}
          overlayTriggerRef={activeMobileMenuTriggerRef}
          drawerPanelRef={mobileMenuPanelRef}
          drawerCloseRef={mobileMenuCloseRef}
          onCloseDrawer={closeMobileWorkspaceOverlay}
          onNameChange={(name) => setBuild((current) => ({ ...current, name }))}
          onReset={resetBuild}
          onShare={shareBuild}
        />
      ) : null}
      <section className={BUILDER_SHELL_CLASS_NAMES.workspace}>
        <div
          className={
            MOBILE_WORKSPACE_SCRIM_CLASS_NAMES[
              isMobileStatsExpanded ? "visible" : "hidden"
            ]
          }
          data-mobile-state={isMobileStatsExpanded ? "visible" : "hidden"}
          data-mobile-workspace-scrim
          aria-hidden="true"
          onPointerDown={(event) => {
            if (event.target !== event.currentTarget) return;
            event.preventDefault();
            event.stopPropagation();
          }}
          onClick={(event) => {
            if (event.target !== event.currentTarget) return;
            event.preventDefault();
            event.stopPropagation();
            closeMobileWorkspaceOverlay();
          }}
        />

        <div className={BUILDER_SHELL_CLASS_NAMES.mainRegion}>
          <aside className={BUILDER_SHELL_CLASS_NAMES.alignmentRail}>
            <header className={WORKSPACE_HEADING_CLASS_NAMES.alignment}>
              <span className={BUILDER_SHELL_CLASS_NAMES.workspaceHeadingLabel}>
                Virtues
              </span>
            </header>
            <VirtuesAffinityModule
              build={build}
              bonuses={calculation.bonusVirtues}
              onVirtuesChange={updateVirtues}
              onSourcesChange={updateAffinitySources}
            />
          </aside>

          <div className={BUILDER_SHELL_CLASS_NAMES.loadoutStage}>
            <PactArtsModule build={build} isOpen={isPactPickerOpen}
              allocations={{ ...pactArtLibrary, ...(build.pact.itemId ? { [build.pact.itemId]: build.pact.artAllocation } : {}) }}
              onOpen={() => setIsPactPickerOpen(true)} onClose={closeBuilderModalLayer}
              onEquip={equipPact} onAllocationChange={updatePactArtAllocation} onResetAllocation={resetPactArtAllocation} />
            <ArmorTalismanEquipmentModule
              build={build}
              calculation={calculation}
              activeSlot={
                isArmorTalismanSlot(activeSlot) ? activeSlot : undefined
              }
              onActiveSlotChange={setActiveSlot}
              onClosePicker={closeBuilderModalLayer}
              onEquipmentChange={(slot, itemId) =>
                setBuild((current) =>
                  updateArmorTalismanEquipment(current, slot, itemId),
                )
              }
            />
            <WeaponEquipmentModule build={build} calculation={calculation}
              activeSlot={activeSlot === "mainHand" || activeSlot === "offHand" ? activeSlot : undefined}
              activeTab={weaponConfigTab}
              onOpen={(slot, tab, index) => { if (index !== undefined) setSelectedTotemSlot(index); setWeaponConfigTab(tab); setActiveSlot(slot); }}
              onConfigure={(tab, index) => { if (index !== undefined) setSelectedTotemSlot(index); setWeaponConfigTab(tab); }}
              onClose={closeBuilderModalLayer}
              onWeaponChange={(slot, itemId) => {
                if (itemId) {
                  const normalized = normalizeWeaponEnhancements(build.weaponEnhancements[slot], weaponById.get(itemId), runeById);
                  if (normalized.changed) notifyAlert({ id: "builder.weapon-enhancements-cleared", title: "Weapon enhancements adjusted", description: "Incompatible Rune or Totem selections were cleared for the new weapon.", severity: "warning" });
                  equipWeapon(slot, itemId, normalized.value);
                } else {
                  const remembered = { ...combatArtLibrary, ...build.combatArts };
                  setCombatArtLibrary(remembered);
                  setBuild((current) => { const equipment = { ...current.equipment }; delete equipment[slot]; return withActiveCombatArts({ ...current, equipment, weaponEnhancements: { ...current.weaponEnhancements, [slot]: createEmptyWeaponEnhancements() } }, remembered); });
                  closeBuilderModalLayer();
                }
              }} />
            <WeaponEnhancementsModule build={build}
              activeSlot={activeSlot === "mainHand" || activeSlot === "offHand" ? activeSlot : undefined}
              activeTab={weaponConfigTab} selectedTotemSlot={selectedTotemSlot}
              onOpen={(slot, tab, index) => { if (index !== undefined) setSelectedTotemSlot(index); setWeaponConfigTab(tab); setActiveSlot(slot); }}
              onClose={closeBuilderModalLayer}
              onEnhancementsChange={(slot, enhancements) => setBuild((current) => ({ ...current, weaponEnhancements: { ...current.weaponEnhancements, [slot]: enhancements } }))}
              onArtAllocationChange={updateCombatArtAllocation} />
          </div>

          <MobileSupportZone />

          <footer className={FOOTER_CLASS_NAMES.root}>
            <span>
              <a
                className={FOOTER_CLASS_NAMES.link}
                href="https://wiki.avakot.org/Armour"
                target="_blank"
                rel="noreferrer"
              >
                Armour
              </a>
              {" · "}
              <a
                className={FOOTER_CLASS_NAMES.link}
                href="https://wiki.avakot.org/Weapons"
                target="_blank"
                rel="noreferrer"
              >
                Weapons ↗
              </a>
            </span>
          </footer>
        </div>

        <section
          ref={mobileStatsDockRef}
          className={MOBILE_STATS_DOCK_CLASS_NAMES[mobileStatsGeometryState]}
          data-mobile-state={mobileStatsPresentationState}
        >
          <div
            ref={mobileStatsPanelRef}
            className={MOBILE_STATS_PANEL_CLASS_NAMES[mobileStatsGeometryState]}
            data-mobile-state={mobileStatsPresentationState}
            data-active-build-effects-open={
              isActiveBuildEffectsOpen ? "true" : undefined
            }
            id="mobile-stats-panel"
          >
            <aside
              ref={mobileStatsRailRef}
              className={
                MOBILE_STATS_RAIL_CLASS_NAMES[mobileStatsGeometryState]
              }
            >
              <div
                className={BUILDER_SHELL_CLASS_NAMES.statSheetSurface}
                data-mobile-state={mobileStatsGeometryState}
                style={
                  mobileStatsPresentationState === "closing"
                    ? { backgroundColor: "transparent" }
                    : undefined
                }
              >
                <div
                  className={
                    MOBILE_STATS_SUMMARY_CLASS_NAMES[mobileStatsGeometryState]
                  }
                  data-mobile-stats-summary
                >
                  <button
                    ref={mobileStatsTriggerRef}
                    type="button"
                    className={
                      MOBILE_STATS_TRIGGER_CLASS_NAMES[mobileStatsGeometryState]
                    }
                    aria-expanded={isMobileStatsExpanded}
                    aria-controls="mobile-stats-panel"
                    aria-label={`${isMobileStatsExpanded ? "Collapse" : "Expand"} stat sheet. ${calculation.total} total defense. Sidearm ${mobileOffHandAttack} attack and ${mobileOffHandCharged} charged attack. Weapon ${mobileMainHandAttack} attack and ${mobileMainHandCharged} charged attack.`}
                    onClick={toggleMobileStats}
                  >
                    <span
                      className={
                        MOBILE_STATS_TRIGGER_ICON_SHELL_CLASS_NAMES[
                          mobileStatsGeometryState
                        ]
                      }
                      aria-hidden="true"
                    >
                      <Image
                        className={MOBILE_TOP_HEADER_MENU_SHELL_CLASS_NAME}
                        src="/icons/game-ui/burger-menu-shell.svg"
                        alt=""
                        width={40}
                        height={40}
                        unoptimized
                      />
                      <Image
                        className={
                          MOBILE_STATS_TRIGGER_ICON_CLASS_NAMES[
                            mobileStatsGeometryState
                          ]
                        }
                        src="/icons/picker-select-arrow.svg"
                        alt=""
                        width={10}
                        height={5}
                        unoptimized
                        data-mobile-stats-arrow
                      />
                    </span>
                  </button>
                  <header
                    className={
                      MOBILE_STATS_HEADING_CLASS_NAMES[mobileStatsGeometryState]
                    }
                  >
                    <span
                      className={
                        BUILDER_SHELL_CLASS_NAMES.statSheetHeaderFloral
                      }
                      aria-hidden="true"
                    />
                    <span
                      className={
                        BUILDER_SHELL_CLASS_NAMES.statSheetHeaderOverlay
                      }
                      aria-hidden="true"
                    />
                    <span
                      className={MOBILE_STATS_HEADING_DIVIDER_CLASS_NAME}
                      data-mobile-state={mobileStatsPresentationState}
                      aria-hidden="true"
                    />
                    <Image
                      className={BUILDER_SHELL_CLASS_NAMES.statSheetHeaderVine}
                      src="/ornaments/themes/nightframe/stat-sheet/stat-sheet-corner-vine-2x.png"
                      alt=""
                      width={1254}
                      height={1254}
                      unoptimized
                      aria-hidden="true"
                    />
                    <h2
                      className={`${BUILDER_SHELL_CLASS_NAMES.statSheetBuildName} ${MOBILE_STATS_TITLE_HEADING_CLASS_NAMES[mobileStatsGeometryState]} compact-desktop:hidden`}
                    >
                      <span
                        className={
                          MOBILE_STATS_TITLE_CLASS_NAMES[
                            mobileStatsGeometryState
                          ]
                        }
                      >
                        Stat Sheet
                      </span>
                    </h2>
                    <BuildNameControl
                      appearance="statSheet"
                      buildName={build.name}
                      controlId="stat-sheet-build-name-value"
                      isActive={!isOptimizationOpen}
                      onNameChange={(name) =>
                        setBuild((current) => ({ ...current, name }))
                      }
                    />
                  </header>
                  <div
                    className={
                      MOBILE_STATS_COMPACT_CLASS_NAMES[
                        mobileStatsPresentationState
                      ]
                    }
                    aria-hidden="true"
                    data-mobile-stats-compact
                  >
                    <div className={MOBILE_STATS_COMPACT_DEFENSE_CLASS_NAME}>
                      <span className={MOBILE_STATS_COMPACT_CREST_CLASS_NAME}>
                        <Image
                          className={
                            MOBILE_STATS_COMPACT_CREST_LAYER_CLASS_NAME
                          }
                          src="/icons/armor-crest/desktop-shield-nightframe-rear-filigree-v3.png"
                          alt=""
                          width={160}
                          height={180}
                          unoptimized
                          draggable={false}
                        />
                        <strong
                          className={MOBILE_STATS_COMPACT_TOTAL_CLASS_NAME}
                        >
                          {calculation.total}
                        </strong>
                      </span>
                      <span
                        className={
                          MOBILE_STATS_COMPACT_DEFENSE_VALUES_CLASS_NAME
                        }
                      >
                        {DEFENSE_IDS.map((defense) => (
                          <span
                            className={
                              MOBILE_STATS_COMPACT_DEFENSE_ITEM_CLASS_NAME
                            }
                            key={defense}
                          >
                            <Image
                              src={defenseMeta[defense].icon}
                              alt=""
                              width={12}
                              height={12}
                              unoptimized
                            />
                            <strong>{calculation.defenses[defense]}</strong>
                          </span>
                        ))}
                      </span>
                    </div>
                    <div className={MOBILE_STATS_COMPACT_GROUP_CLASS_NAME}>
                      <span
                        className={MOBILE_STATS_COMPACT_GROUP_LABEL_CLASS_NAME}
                      >
                        Sidearm
                      </span>
                      <span className={MOBILE_STATS_COMPACT_METRICS_CLASS_NAME}>
                        <span
                          className={MOBILE_STATS_COMPACT_METRIC_CLASS_NAME}
                        >
                          <small
                            className={
                              MOBILE_STATS_COMPACT_METRIC_LABEL_CLASS_NAME
                            }
                          >
                            Atk
                          </small>
                          <strong
                            className={
                              MOBILE_STATS_COMPACT_METRIC_VALUE_CLASS_NAME
                            }
                          >
                            {mobileOffHandAttack}
                          </strong>
                        </span>
                        <span
                          className={MOBILE_STATS_COMPACT_METRIC_CLASS_NAME}
                        >
                          <small
                            className={
                              MOBILE_STATS_COMPACT_METRIC_LABEL_CLASS_NAME
                            }
                          >
                            Chg
                          </small>
                          <strong
                            className={
                              MOBILE_STATS_COMPACT_METRIC_VALUE_CLASS_NAME
                            }
                          >
                            {mobileOffHandCharged}
                          </strong>
                        </span>
                      </span>
                    </div>
                    <div className={MOBILE_STATS_COMPACT_GROUP_CLASS_NAME}>
                      <span
                        className={MOBILE_STATS_COMPACT_GROUP_LABEL_CLASS_NAME}
                      >
                        Weapon
                      </span>
                      <span className={MOBILE_STATS_COMPACT_METRICS_CLASS_NAME}>
                        <span
                          className={MOBILE_STATS_COMPACT_METRIC_CLASS_NAME}
                        >
                          <small
                            className={
                              MOBILE_STATS_COMPACT_METRIC_LABEL_CLASS_NAME
                            }
                          >
                            Atk
                          </small>
                          <strong
                            className={
                              MOBILE_STATS_COMPACT_METRIC_VALUE_CLASS_NAME
                            }
                          >
                            {mobileMainHandAttack}
                          </strong>
                        </span>
                        <span
                          className={MOBILE_STATS_COMPACT_METRIC_CLASS_NAME}
                        >
                          <small
                            className={
                              MOBILE_STATS_COMPACT_METRIC_LABEL_CLASS_NAME
                            }
                          >
                            Chg
                          </small>
                          <strong
                            className={
                              MOBILE_STATS_COMPACT_METRIC_VALUE_CLASS_NAME
                            }
                          >
                            {mobileMainHandCharged}
                          </strong>
                        </span>
                      </span>
                    </div>
                  </div>
                  <div
                    className={
                      MOBILE_STATS_EXPANDED_CONTENT_CLASS_NAMES[
                        mobileStatsPresentationState
                      ]
                    }
                    aria-hidden={
                      mobileStatsPresentationState === "closing"
                        ? true
                        : undefined
                    }
                    inert={mobileStatsPresentationState === "closing"}
                  >
                    <div className={MOBILE_DEFENSE_BACKDROP_CLASS_NAME}>
                      <div
                        className={
                          MOBILE_DEFENSE_HUD_CLASS_NAMES[
                            mobileStatsGeometryState
                          ]
                        }
                        aria-label={`${calculation.total} total defense`}
                        data-mobile-stats-block="defense"
                      >
                        <div
                          className={
                            MOBILE_DEFENSE_PLAQUE_CLASS_NAMES[
                              mobileStatsGeometryState
                            ]
                          }
                        >
                          <svg
                            className={
                              MOBILE_DEFENSE_PLAQUE_DECORATION_CLASS_NAMES[
                                mobileStatsGeometryState
                              ]
                            }
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                            aria-hidden="true"
                          >
                            <defs>
                              <linearGradient
                                id="defense-plaque-surface"
                                x1="0"
                                y1="0"
                                x2="1"
                                y2="0"
                              >
                                <stop
                                  offset="0"
                                  stopColor="#1e1812"
                                  stopOpacity="0.96"
                                />
                                <stop
                                  offset="1"
                                  stopColor="#2d2219"
                                  stopOpacity="0.9"
                                />
                              </linearGradient>
                              <linearGradient
                                id="defense-plaque-sheen"
                                x1="0"
                                y1="0"
                                x2="1"
                                y2="0"
                              >
                                <stop
                                  offset="0"
                                  stopColor="#d5a859"
                                  stopOpacity="0.2"
                                />
                                <stop
                                  offset="0.72"
                                  stopColor="#d5a859"
                                  stopOpacity="0"
                                />
                              </linearGradient>
                            </defs>
                            <path
                              d="M2 4 96 1 98 12 95 26 99 40 96 54 99 69 95 84 98 97 3 100 0 88 3 73 0 57 3 40 0 22Z"
                              fill="url(#defense-plaque-surface)"
                            />
                            <path
                              d="M2 4 96 1 98 12 95 26 99 40 96 54 99 69 95 84 98 97 3 100 0 88 3 73 0 57 3 40 0 22Z"
                              fill="url(#defense-plaque-sheen)"
                            />
                          </svg>
                          {DEFENSE_IDS.map((defense) => (
                            <div
                              className={
                                MOBILE_DEFENSE_STAT_CLASS_NAMES[
                                  mobileStatsGeometryState
                                ]
                              }
                              data-mobile-stats-detail
                              key={defense}
                            >
                              <Image
                                className={
                                  MOBILE_DEFENSE_STAT_IMAGE_CLASS_NAMES[
                                    mobileStatsGeometryState
                                  ]
                                }
                                src={defenseMeta[defense].icon}
                                alt=""
                                aria-hidden="true"
                                width={32}
                                height={32}
                                unoptimized
                              />
                              <span
                                className={
                                  MOBILE_DEFENSE_LABEL_CLASS_NAMES[
                                    mobileStatsGeometryState
                                  ]
                                }
                              >
                                {defenseMeta[defense].label}
                              </span>
                              <span
                                className={
                                  MOBILE_DEFENSE_SHORT_LABEL_CLASS_NAMES[
                                    mobileStatsGeometryState
                                  ]
                                }
                                aria-hidden="true"
                              >
                                {MOBILE_DEFENSE_SHORT_LABELS[defense]}
                              </span>
                              <strong
                                className={
                                  MOBILE_DEFENSE_STAT_VALUE_CLASS_NAMES[
                                    mobileStatsGeometryState
                                  ]
                                }
                              >
                                {calculation.defenses[defense]}
                              </strong>
                              <button
                                ref={(element) => {
                                  if (element) {
                                    defenseContextTriggerRefs.current.set(
                                      defense,
                                      element,
                                    );
                                  } else {
                                    defenseContextTriggerRefs.current.delete(
                                      defense,
                                    );
                                  }
                                }}
                                className={MOBILE_DEFENSE_STAT_INFO_CLASS_NAME}
                                type="button"
                                aria-label={`Explain ${defenseMeta[defense].label}`}
                                aria-describedby={
                                  activeDefenseContext === defense
                                    ? `defense-context-${defense}`
                                    : undefined
                                }
                                aria-expanded={activeDefenseContext === defense}
                                onPointerEnter={(event) => {
                                  if (event.pointerType === "mouse") {
                                    showDefenseContext(defense);
                                  }
                                }}
                                onPointerLeave={(event) => {
                                  if (
                                    event.pointerType === "mouse" &&
                                    document.activeElement !==
                                      event.currentTarget
                                  ) {
                                    hideDefenseContext();
                                  }
                                }}
                                onPointerDown={() => {
                                  defensePointerDownWasActiveRef.current =
                                    activeDefenseContext === defense;
                                }}
                                onFocus={() => showDefenseContext(defense)}
                                onBlur={() => hideDefenseContext()}
                                onKeyDown={(event) => {
                                  if (
                                    event.key !== "Enter" &&
                                    event.key !== " "
                                  ) {
                                    return;
                                  }
                                  event.preventDefault();
                                  setActiveDefenseContext((current) =>
                                    current === defense ? undefined : defense,
                                  );
                                }}
                                onClick={(event) => {
                                  if (event.detail === 0) return;
                                  if (defensePointerDownWasActiveRef.current) {
                                    hideDefenseContext();
                                  } else {
                                    showDefenseContext(defense);
                                  }
                                }}
                              >
                                <span
                                  className={
                                    MOBILE_DEFENSE_STAT_INFO_GLYPH_CLASS_NAME
                                  }
                                  aria-hidden="true"
                                >
                                  i
                                </span>
                              </button>
                            </div>
                          ))}
                        </div>

                        <div
                          className={
                            MOBILE_DEFENSE_CREST_CLASS_NAMES[
                              mobileStatsGeometryState
                            ]
                          }
                          aria-hidden="true"
                          data-mobile-stats-shield
                        >
                          <Image
                            className={`${MOBILE_DEFENSE_LAYER_CLASS_NAMES[mobileStatsGeometryState]} block max-tablet:scale-[1.2] compact-desktop:scale-[1.2]`}
                            src="/icons/armor-crest/desktop-shield-nightframe-rear-filigree-v3.png"
                            alt=""
                            width={160}
                            height={180}
                            unoptimized
                            draggable={false}
                          />
                          {[
                            "shield-bg",
                            "shield-bg-art",
                            "shield-border",
                            "filigree",
                          ].map((layer) => (
                            <Image
                              className={`${MOBILE_DEFENSE_LAYER_CLASS_NAMES[mobileStatsGeometryState]} hidden ${
                                layer === "filigree"
                                  ? MOBILE_DEFENSE_FILIGREE_CLASS_NAMES[
                                      mobileStatsGeometryState
                                    ]
                                  : ""
                              }`}
                              src={`/icons/armor-crest/${layer}.svg`}
                              alt=""
                              width={160}
                              height={180}
                              unoptimized
                              draggable={false}
                              data-mobile-stats-filigree={
                                layer === "filigree" ? "" : undefined
                              }
                              key={layer}
                            />
                          ))}
                          <span
                            className={
                              MOBILE_DEFENSE_TOTAL_LABEL_CLASS_NAMES[
                                mobileStatsGeometryState
                              ]
                            }
                            data-mobile-stats-detail
                          >
                            Total Def
                          </span>
                          <strong
                            className={
                              MOBILE_DEFENSE_TOTAL_CLASS_NAMES[
                                mobileStatsGeometryState
                              ]
                            }
                          >
                            {calculation.total}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <section
                      className={
                        MOBILE_BUILD_DAMAGE_CLASS_NAMES[
                          mobileStatsGeometryState
                        ]
                      }
                    >
                      <div
                        className={
                          MOBILE_BUILD_DAMAGE_PANELS_CLASS_NAMES[
                            mobileStatsGeometryState
                          ]
                        }
                      >
                        <WeaponDamagePanel
                          hand="Sidearm"
                          index={2}
                          mobileHand="Sidearm"
                          mobileStatsState={mobileStatsGeometryState}
                          morphKey="sidearm"
                          virtues={calculation.effectiveVirtues}
                          item={
                            build.equipment.offHand
                              ? weaponById.get(build.equipment.offHand)
                              : undefined
                          }
                        />
                        <WeaponDamagePanel
                          hand="Weapon"
                          index={1}
                          mobileHand="Weapon"
                          mobileStatsState={mobileStatsGeometryState}
                          morphKey="main"
                          virtues={calculation.effectiveVirtues}
                          item={
                            build.equipment.mainHand
                              ? weaponById.get(build.equipment.mainHand)
                              : undefined
                          }
                        />
                      </div>
                    </section>
                  </div>
                </div>

                <ActiveBuildEffects
                  build={build}
                  mobileStatsState={mobileStatsDetailState}
                  onOpenChange={handleActiveBuildEffectsOpenChange}
                />

                {calculation.modifiers.attack > 0 ||
                calculation.modifiers.stagger > 0 ? (
                  <div
                    className={
                      MOBILE_SECONDARY_MODIFIERS_CLASS_NAMES[
                        mobileStatsDetailState
                      ]
                    }
                  >
                    {calculation.modifiers.attack > 0 ? (
                      <span className={SECONDARY_MODIFIER_CLASS_NAMES.item}>
                        <small className={SECONDARY_MODIFIER_CLASS_NAMES.label}>
                          Attack
                        </small>
                        <strong
                          className={SECONDARY_MODIFIER_CLASS_NAMES.value}
                        >
                          +{calculation.modifiers.attack}
                        </strong>
                      </span>
                    ) : null}
                    {calculation.modifiers.stagger > 0 ? (
                      <span className={SECONDARY_MODIFIER_CLASS_NAMES.item}>
                        <small className={SECONDARY_MODIFIER_CLASS_NAMES.label}>
                          Stagger
                        </small>
                        <strong
                          className={SECONDARY_MODIFIER_CLASS_NAMES.value}
                        >
                          +{calculation.modifiers.stagger}
                        </strong>
                      </span>
                    ) : null}
                  </div>
                ) : null}
                <Image
                  className={BUILDER_SHELL_CLASS_NAMES.statSheetBottomRightVine}
                  src="/ornaments/themes/nightframe/stat-sheet/stat-sheet-corner-vine-v2.png"
                  alt=""
                  width={1254}
                  height={1254}
                  unoptimized
                  aria-hidden="true"
                />
              </div>
            </aside>
          </div>
          <Image
            className={BUILDER_SHELL_CLASS_NAMES.statSheetMobileDockVine}
            src="/ornaments/themes/nightframe/stat-sheet/stat-sheet-corner-vine-2x.png"
            alt=""
            width={1254}
            height={1254}
            unoptimized
            aria-hidden="true"
            data-mobile-state={mobileStatsGeometryState}
          />
        </section>
      </section>

      {hydrated && activeDefenseContext
        ? createPortal(
            <div
              ref={defenseContextPopoverRef}
              className={`${MOBILE_DEFENSE_STAT_CONTEXT_CLASS_NAME} ${MOBILE_DEFENSE_STAT_CONTEXT_ACTIVE_CLASS_NAME}`}
              id={`defense-context-${activeDefenseContext}`}
              role="tooltip"
              style={
                defenseContextPosition
                  ? {
                      left: defenseContextPosition.left,
                      top: defenseContextPosition.top,
                    }
                  : { left: 0, top: 0, visibility: "hidden" }
              }
            >
              <strong className={MOBILE_DEFENSE_STAT_CONTEXT_TITLE_CLASS_NAME}>
                {defenseMeta[activeDefenseContext].label}
              </strong>
              <span className={MOBILE_DEFENSE_STAT_CONTEXT_COPY_CLASS_NAME}>
                {DEFENSE_CONTEXT_COPY[activeDefenseContext]}
              </span>
              <span className={MOBILE_DEFENSE_STAT_CONTEXT_COPY_CLASS_NAME}>
                Each armor piece contributes its base value plus floor(12% × the
                sum of its attunement pips × your effective Virtues). Unmet
                requirements disable that piece&apos;s scaling; flat Talisman
                defense is added last.
              </span>
            </div>,
            document.body,
          )
        : null}

      {optimizationMode !== undefined ? (
        <BuilderOptimizationLightbox
          result={optimizationResult}
          mobileCloseRef={mobileTopMenuTriggerRef}
          onClose={closeBuilderModalLayer}
          onSelectStrategy={(strategy) => setOptimizationMode(strategy)}
          onApply={() => {
            if (!optimizationResult) return;
            setBuild(optimizationResult.recommendedBuild);
            closeBuilderModalLayer();
            notifyAlert({
              id: "builder.optimization",
              title: "Build optimized",
              description:
                optimizationResult.kind === "affinity"
                  ? "Affinity optimized for the equipped armor."
                  : "Recommended armor equipped. Weapons and Talismans were preserved.",
              severity: "info",
            });
          }}
          portalContainer={
            isMobileViewport && isMobileMenuAvailable
              ? (mobileHeaderLayerElement ?? mobileMenuLayerElement)
              : undefined
          }
        />
      ) : null}
    </main>
  );
}
