"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Image from "next/image";
import { armorById, armorCatalogue } from "@/src/data/catalogue";
import {
  talismanById,
  talismanCatalogue,
} from "@/src/data/talismans";
import {
  weaponById,
  weaponCatalogue,
} from "@/src/data/weapons";
import {
  pactById,
  pactCatalogue,
} from "@/src/data/pacts";
import {
  runeById,
  runeCatalogue,
} from "@/src/data/runes";
import { totemCatalogue } from "@/src/data/totems";
import {
  combatArtByName,
  pactArtTreeByPactId,
} from "@/src/data/arts";
import {
  calculateBuild,
} from "@/src/domain/calculation";
import {
  LEGACY_STORAGE_KEYS,
  STORAGE_KEY,
  deserializeBuild,
  parseStoredBuild,
  serializeBuild,
} from "@/src/domain/serialization";
import { distributeVirtueTotal } from "@/src/domain/virtue-alignment";
import {
  getAllocatableAffinity,
} from "@/src/domain/affinity";
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
  ARMOR_SLOTS,
  DEFENSE_IDS,
  VIRTUE_IDS,
  type AffinitySources,
  type ArtAllocation,
  type ArmorSlot,
  type EquipmentSlot,
  type SoulframeBuild,
  type VirtueValues,
} from "@/src/domain/types";
import {
  DEFAULT_BUILD,
  defenseMeta,
  virtueMeta,
} from "./constants";
import {
  MOBILE_DEFENSE_LABEL_CLASS_NAMES,
  MOBILE_DEFENSE_SHORT_LABEL_CLASS_NAMES,
} from "./components/accessibilityClassNames";
import {
  BUILD_REQUIREMENT_CLASS_NAMES,
  BUILDER_SHELL_CLASS_NAMES,
  FOOTER_CLASS_NAMES,
  SECONDARY_MODIFIER_CLASS_NAMES,
  WORKSPACE_HEADING_CLASS_NAMES,
} from "./components/builderShellClassNames";
import { MOBILE_TOP_HEADER_MENU_SHELL_CLASS_NAME } from "./components/mobileHeaderClassNames";
import {
  MOBILE_BUILD_DAMAGE_CLASS_NAMES,
  MOBILE_BUILD_DAMAGE_HEADING_CLASS_NAMES,
  MOBILE_BUILD_DAMAGE_PANELS_CLASS_NAMES,
  MOBILE_BUILD_REQUIREMENT_CLASS_NAMES,
  MOBILE_DEFENSE_CREST_CLASS_NAMES,
  MOBILE_DEFENSE_FILIGREE_CLASS_NAMES,
  MOBILE_DEFENSE_HUD_CLASS_NAMES,
  MOBILE_DEFENSE_LAYER_CLASS_NAMES,
  MOBILE_DEFENSE_PLAQUE_CLASS_NAMES,
  MOBILE_DEFENSE_PLAQUE_DECORATION_CLASS_NAMES,
  MOBILE_DEFENSE_STAT_CLASS_NAMES,
  MOBILE_DEFENSE_STAT_IMAGE_CLASS_NAMES,
  MOBILE_DEFENSE_STAT_VALUE_CLASS_NAMES,
  MOBILE_DEFENSE_TOTAL_CLASS_NAMES,
  MOBILE_DEFENSE_TOTAL_LABEL_CLASS_NAMES,
  MOBILE_STATS_DOCK_CLASS_NAMES,
  MOBILE_STATS_HEADING_CLASS_NAMES,
  MOBILE_STATS_PANEL_CLASS_NAMES,
  MOBILE_STATS_RAIL_CLASS_NAMES,
  MOBILE_STATS_SUMMARY_CLASS_NAMES,
  MOBILE_STATS_TRIGGER_CLASS_NAMES,
  MOBILE_STATS_TRIGGER_ICON_CLASS_NAMES,
  MOBILE_STATS_TRIGGER_ICON_SHELL_CLASS_NAMES,
  MOBILE_SECONDARY_MODIFIERS_CLASS_NAMES,
  MOBILE_WORKSPACE_SCRIM_CLASS_NAMES,
} from "./components/mobileWorkspaceClassNames";
import { VirtueAlignment as BuilderVirtueAlignment } from "./affinity/VirtueAlignment";
import {
  EquipmentSlot as BuilderEquipmentSlot,
  TalismanEquipmentSlot as BuilderTalismanEquipmentSlot,
  WeaponEquipmentSlot as BuilderWeaponEquipmentSlot,
} from "./loadout/EquipmentSlots";
import { PactBanner as BuilderPactBanner } from "./loadout/PactBanner";
import { PactPicker as BuilderPactPicker } from "./pickers/pact/PactPicker";
import { ItemPicker as BuilderArmorPicker } from "./pickers/armor/ArmorPicker";
import { TalismanPicker as BuilderTalismanPicker } from "./pickers/talisman/TalismanPicker";
import {
  OptimizationLightbox as BuilderOptimizationLightbox,
  type OptimizationResult,
} from "./optimization/OptimizationLightbox";
import { MobileSupportZone } from "./support/MobileSupportZone";
import { WeaponEnhancementPicker as BuilderWeaponEnhancementPicker } from "./pickers/weapon/WeaponEnhancementPicker";
import { WeaponPicker as BuilderWeaponPicker } from "./pickers/weapon/WeaponPicker";
import { ActiveBuildEffects } from "./stats/ActiveBuildEffects";
import { WeaponDamagePanel } from "./stats/WeaponDamagePanel";
import { getWeaponDamageRows } from "./lib/weapon-damage";
import { useMobileWorkspace } from "./hooks/useMobileWorkspace";
import { BuilderHeader } from "./header/BuilderHeader";
import { MobileHeaderDrawer } from "./header/MobileHeaderDrawer";
import { useAlerts } from "../alerts/AlertsProvider";
import { useMobileHistoryLayer } from "../hooks/useMobileHistoryLayer";

const UNMET_GEAR_ALERT_ID = "builder.unmet-gear-requirements";
const PACT_ART_LIBRARY_KEY = "soulframe-framer.pact-arts.v1";
const COMBAT_ART_LIBRARY_KEY = "soulframe-framer.combat-arts.v1";

type ArtLibrary = Record<string, ArtAllocation>;

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
  return [...new Set(
    (["mainHand", "offHand"] as const).flatMap((slot) => {
      const itemId = build.equipment[slot];
      const artName = itemId ? weaponById.get(itemId)?.combatArt : undefined;
      return artName && combatArtByName.has(artName) ? [artName] : [];
    }),
  )];
}

function hydrateActiveArts(
  build: SoulframeBuild,
  pactLibrary: ArtLibrary,
  combatLibrary: ArtLibrary,
  sourceSchemaVersion?: 1 | 2 | 3 | 4 | 5,
): SoulframeBuild {
  const pact = build.pact.itemId ? pactById.get(build.pact.itemId) : undefined;
  const hasExplicitV5Arts = sourceSchemaVersion === 5;
  const hasExplicitV4PactArts =
    sourceSchemaVersion === 4 && Boolean(pact);
  const artAllocation = pact
    ? normalizePactArtAllocation(
        pact,
        hasExplicitV5Arts || hasExplicitV4PactArts
          ? build.pact.artAllocation
          : pactLibrary[pact.id] ??
            (Object.keys(build.pact.artAllocation).length
              ? build.pact.artAllocation
              : createDefaultPactArtAllocation(pact)),
      ).value
    : {};
  const combatArts = Object.fromEntries(
    getActiveCombatArtNames(build).map((artName) => [
      artName,
      normalizeCombatArtAllocation(
        artName,
        hasExplicitV5Arts
          ? build.combatArts[artName] ?? createDefaultCombatArtAllocation()
          : combatLibrary[artName] ?? createDefaultCombatArtAllocation(),
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

export function BuilderShell() {
  const {
    closeAlertCenter,
    isCenterOpen,
    mobileHeaderLayerElement,
    notifyAlert,
    setMobileHeaderLayerElement,
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
    isMobileHeaderVisible,
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
    mobileCompactMenuTriggerRef,
    activeMobileMenuTriggerRef,
    mobileMenuPanelRef,
    mobileMenuCloseRef,
    mobileStatsDockRef,
    mobileStatsTriggerRef,
    mobileStatsPanelRef,
    mobileStatsRailRef,
  } = useMobileWorkspace(build, isMobileShellSuppressed);
  const sharedMobileHeaderLayerRef = useCallback(
    (element: HTMLDivElement | null) => {
      mobileMenuLayerRef(element);
      setMobileHeaderLayerElement(
        isMobileViewport && isMobileMenuAvailable ? element : null,
      );
    }, [
      isMobileMenuAvailable,
      isMobileViewport,
      mobileMenuLayerRef,
      setMobileHeaderLayerElement,
    ],
  );
  const [hydrated, setHydrated] = useState(false);
  const mobileStatsGeometryState =
    mobileStatsPresentationState === "collapsed"
      ? "collapsed"
      : "expanded";
  const mobileStatsDetailState =
    mobileStatsPresentationState === "collapsed"
      ? "collapsed"
      : "expanded";
  const calculation = useMemo(
    () => calculateBuild(build, armorCatalogue, talismanCatalogue),
    [build],
  );
  const optimizationResult = useMemo<OptimizationResult | undefined>(() => {
    if (optimizationMode === "affinity") {
      return optimizeAffinityForArmor(
        build,
        armorCatalogue,
        talismanCatalogue,
      );
    }
    if (optimizationMode === "armor") {
      return optimizeArmorForAffinity(
        build,
        armorCatalogue,
        talismanCatalogue,
      );
    }
    return undefined;
  }, [build, optimizationMode]);
  const unmetRequirementCount = calculation.items.filter(
    (item) => !item.requirementMet,
  ).length;
  const mobileMainHandAttack = getWeaponDamageRows(
    build.equipment.mainHand
      ? weaponById.get(build.equipment.mainHand)
      : undefined,
    calculation.effectiveVirtues,
  )
    .find((stat) => stat.id === "attack")?.value ?? "—";
  const mobileOffHandAttack = getWeaponDamageRows(
    build.equipment.offHand
      ? weaponById.get(build.equipment.offHand)
      : undefined,
    calculation.effectiveVirtues,
  )
    .find((stat) => stat.id === "attack")?.value ?? "—";
  const unmetRequirementGroups = VIRTUE_IDS.flatMap((virtue) => {
    const unmetItems = calculation.items.flatMap((contribution) => {
      if (contribution.requirementMet) return [];
      const item = armorById.get(contribution.itemId);
      return item?.requirement?.virtue === virtue ? [item] : [];
    });
    if (!unmetItems.length) return [];

    return [
      {
        virtue,
        itemCount: unmetItems.length,
        required: Math.max(
          ...unmetItems.map((item) => item.requirement?.value ?? 0),
        ),
      },
    ];
  });
  const unmetRequirementDescription = unmetRequirementGroups
    .map(
      (group) =>
        `${virtueMeta[group.virtue].label} ${calculation.effectiveVirtues[group.virtue]}/${group.required} · ${group.itemCount} piece${group.itemCount === 1 ? "" : "s"} base-only`,
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
        LEGACY_STORAGE_KEYS.map((key) =>
          window.localStorage.getItem(key),
        ).find((value) => value !== null);
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
      virtues,
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
      setBuild((current) =>
        withPactArtAllocation(current, pactId, normalized),
      );
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
    setBuild((current) =>
      withPactArtAllocation(current, pactId, allocation),
    );
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

  const resetCombatArtAllocation = (artName: string) => {
    updateCombatArtAllocation(artName, createDefaultCombatArtAllocation());
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
        title: "Build link ready",
        description: "Build link copied to your clipboard.",
        severity: "info",
      });
    } catch {
      window.history.replaceState(window.history.state, "", url);
      notifyAlert({
        id: "builder.share",
        title: "Build link ready",
        description: "Build link added to the address bar.",
        severity: "info",
      });
    }
  };

  const resetBuild = () => {
    setBuild(
      hydrateActiveArts(
        DEFAULT_BUILD,
        pactArtLibrary,
        combatArtLibrary,
      ),
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
    }, [closeAlertCenter, isMobileMenuOpen, toggleMobileMenu],
  );

  const openOptimization = useCallback(() => {
    closeAlertCenter();
    if (isMobileMenuOpen) closeMobileWorkspaceOverlay();
    setOptimizationMode("choose");
  }, [
    closeAlertCenter,
    closeMobileWorkspaceOverlay,
    isMobileMenuOpen,
  ]);

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

  return (
    <main className={BUILDER_SHELL_CLASS_NAMES.app}>
      <BuilderHeader
        buildName={build.name}
        isAlertCenterOpen={isCenterOpen}
        isMobileMenuAvailable={isMobileMenuAvailable}
        isMobileMenuOpen={isMobileMenuOpen}
        isMobileSuppressed={isMobileShellSuppressed}
        isOptimizationOpen={isOptimizationOpen}
        mobileMenuTriggerRef={mobileTopMenuTriggerRef}
        mobileMenuLayerRef={sharedMobileHeaderLayerRef}
        onCloseOptimization={closeBuilderModalLayer}
        onNameChange={(name) =>
          setBuild((current) => ({ ...current, name }))
        }
        onOpenOptimization={openOptimization}
        onToggleMobileMenu={toggleBuilderMenu}
      />
      <MobileHeaderDrawer
        buildName={build.name}
        isHeaderVisible={isMobileHeaderVisible}
        isMenuAvailable={isMobileMenuAvailable}
        isDrawerOpen={isMobileMenuOpen}
        isSuppressed={isMobileShellSuppressed}
        menuTriggerRef={mobileCompactMenuTriggerRef}
        menuLayerElement={mobileMenuLayerElement}
        overlayTriggerRef={activeMobileMenuTriggerRef}
        drawerPanelRef={mobileMenuPanelRef}
        drawerCloseRef={mobileMenuCloseRef}
        onToggleDrawer={toggleBuilderMenu}
        onCloseDrawer={closeMobileWorkspaceOverlay}
        onNameChange={(name) =>
          setBuild((current) => ({ ...current, name }))
        }
        onOpenOptimization={openOptimization}
        onReset={resetBuild}
        onShare={shareBuild}
      />
      <section className={BUILDER_SHELL_CLASS_NAMES.workspace}>
        <div
          className={
            MOBILE_WORKSPACE_SCRIM_CLASS_NAMES[
              isMobileStatsExpanded ? "visible" : "hidden"
            ]
          }
          data-mobile-state={
            isMobileStatsExpanded ? "visible" : "hidden"
          }
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

        <aside className={BUILDER_SHELL_CLASS_NAMES.alignmentRail}>
          <header className={WORKSPACE_HEADING_CLASS_NAMES.alignment}>
            <span className={BUILDER_SHELL_CLASS_NAMES.workspaceHeadingLabel}>
              Virtues
            </span>
          </header>
          <BuilderVirtueAlignment
            virtues={build.virtues}
            bonuses={calculation.bonusVirtues}
            sources={build.affinitySources}
            onChange={updateVirtues}
            onSourcesChange={updateAffinitySources}
          />
        </aside>

        <div className={BUILDER_SHELL_CLASS_NAMES.loadoutStage}>
          <BuilderPactBanner
            pact={
              build.pact.itemId
                ? pactById.get(build.pact.itemId)
                : undefined
            }
            artAllocation={build.pact.artAllocation}
            isActive={isPactPickerOpen}
            onOpen={() => setIsPactPickerOpen(true)}
          />
          {ARMOR_SLOTS.map((slot) => {
            const itemId = build.equipment[slot];
            const item = itemId ? armorById.get(itemId) : undefined;
            const contribution = calculation.items.find(
              (entry) => entry.itemId === itemId,
            );
            return (
              <BuilderEquipmentSlot
                key={slot}
                slot={slot}
                item={item}
                contribution={contribution}
                virtues={calculation.effectiveVirtues}
                isActive={activeSlot === slot}
                onOpen={() => setActiveSlot(slot)}
              />
            );
          })}

          <BuilderTalismanEquipmentSlot
            item={
              build.equipment.talisman
                ? talismanById.get(build.equipment.talisman)
                : undefined
            }
            isActive={activeSlot === "talisman"}
            onOpen={() => setActiveSlot("talisman")}
          />
          {(["offHand", "mainHand"] as const).map((slot) => (
            <BuilderWeaponEquipmentSlot
              key={slot}
              slot={slot}
              item={
                build.equipment[slot]
                  ? weaponById.get(build.equipment[slot]!)
                  : undefined
              }
              enhancements={build.weaponEnhancements[slot]}
              isActive={activeSlot === slot}
              onOpenWeapon={() => {
                setWeaponConfigTab("weapon");
                setActiveSlot(slot);
              }}
              onOpenRune={() => {
                setWeaponConfigTab("rune");
                setActiveSlot(slot);
              }}
              onOpenTotem={(index) => {
                setSelectedTotemSlot(index);
                setWeaponConfigTab("totems");
                setActiveSlot(slot);
              }}
            />
          ))}
          <MobileSupportZone />
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
            id="mobile-stats-panel"
          >
            <aside
              ref={mobileStatsRailRef}
              className={MOBILE_STATS_RAIL_CLASS_NAMES[mobileStatsGeometryState]}
            >
              <div
                className={BUILDER_SHELL_CLASS_NAMES.statSheetSurface}
              >
                <div
                  className={MOBILE_STATS_SUMMARY_CLASS_NAMES[mobileStatsGeometryState]}
                  data-mobile-stats-summary
                >
                  <button
                    ref={mobileStatsTriggerRef}
                    type="button"
                    className={MOBILE_STATS_TRIGGER_CLASS_NAMES[mobileStatsGeometryState]}
                    aria-expanded={isMobileStatsExpanded}
                    aria-controls="mobile-stats-panel"
                    aria-label={`${isMobileStatsExpanded ? "Collapse" : "Expand"} stat sheet. ${calculation.total} total defense. Main ${mobileMainHandAttack} attack. Sidearm ${mobileOffHandAttack} attack.`}
                    onClick={toggleMobileStats}
                  >
                    <span
                      className={MOBILE_STATS_TRIGGER_ICON_SHELL_CLASS_NAMES[mobileStatsGeometryState]}
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
                        className={MOBILE_STATS_TRIGGER_ICON_CLASS_NAMES[mobileStatsGeometryState]}
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
                    className={MOBILE_STATS_HEADING_CLASS_NAMES[mobileStatsGeometryState]}
                  >
                    <span className={BUILDER_SHELL_CLASS_NAMES.workspaceHeadingLabel}>
                      Stat Sheet
                    </span>
                    <small className={BUILDER_SHELL_CLASS_NAMES.workspaceHeadingMeta}>
                      {calculation.total} defense
                    </small>
                  </header>
                  <div
                    className={MOBILE_DEFENSE_HUD_CLASS_NAMES[mobileStatsGeometryState]}
                    aria-label={`${calculation.total} total defense`}
                    data-mobile-stats-block="defense"
                  >
                    <div
                      className={MOBILE_DEFENSE_PLAQUE_CLASS_NAMES[mobileStatsGeometryState]}
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
                            <stop offset="0" stopColor="#1e1812" stopOpacity="0.96" />
                            <stop offset="1" stopColor="#2d2219" stopOpacity="0.9" />
                          </linearGradient>
                          <linearGradient
                            id="defense-plaque-sheen"
                            x1="0"
                            y1="0"
                            x2="1"
                            y2="0"
                          >
                            <stop offset="0" stopColor="#d5a859" stopOpacity="0.2" />
                            <stop offset="0.72" stopColor="#d5a859" stopOpacity="0" />
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
                            MOBILE_DEFENSE_STAT_CLASS_NAMES[mobileStatsGeometryState]
                          }
                          title={defenseMeta[defense].label}
                          data-mobile-stats-detail
                          key={defense}
                        >
                          <Image
                            className={
                              MOBILE_DEFENSE_STAT_IMAGE_CLASS_NAMES[mobileStatsGeometryState]
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
                        </div>
                      ))}
                    </div>

                    <div
                      className={MOBILE_DEFENSE_CREST_CLASS_NAMES[mobileStatsGeometryState]}
                      aria-hidden="true"
                      data-mobile-stats-shield
                    >
                      {[
                        "shield-bg",
                        "shield-bg-art",
                        "shield-border",
                        "filigree",
                      ].map((layer) => (
                        <Image
                          className={`${MOBILE_DEFENSE_LAYER_CLASS_NAMES[mobileStatsGeometryState]} ${
                            layer === "filigree"
                              ? MOBILE_DEFENSE_FILIGREE_CLASS_NAMES[mobileStatsGeometryState]
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
                          MOBILE_DEFENSE_TOTAL_LABEL_CLASS_NAMES[mobileStatsGeometryState]
                        }
                        data-mobile-stats-detail
                      >
                        Total Def
                      </span>
                      <strong
                        className={
                          MOBILE_DEFENSE_TOTAL_CLASS_NAMES[mobileStatsGeometryState]
                        }
                      >
                        {calculation.total}
                      </strong>
                    </div>
                  </div>

                  {unmetRequirementCount > 0 ? (
                    <div
                      className={
                        MOBILE_BUILD_REQUIREMENT_CLASS_NAMES[mobileStatsGeometryState]
                      }
                      role="status"
                    >
                      <strong className={BUILD_REQUIREMENT_CLASS_NAMES.title}>
                        {unmetRequirementCount} requirement
                        {unmetRequirementCount === 1 ? "" : "s"} unmet
                      </strong>
                      {unmetRequirementGroups.map((group) => (
                        <span
                          className={BUILD_REQUIREMENT_CLASS_NAMES.detail}
                          key={group.virtue}
                        >
                          {virtueMeta[group.virtue].label}{" "}
                          {calculation.effectiveVirtues[group.virtue]}/{group.required}
                        {" · "}
                        {group.itemCount} piece{group.itemCount === 1 ? "" : "s"}{" "}
                        base-only
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <section
                    className={MOBILE_BUILD_DAMAGE_CLASS_NAMES[mobileStatsGeometryState]}
                  >
                  <header
                    className={
                      MOBILE_BUILD_DAMAGE_HEADING_CLASS_NAMES[mobileStatsGeometryState]
                    }
                  >
                    <span
                      className={BUILDER_SHELL_CLASS_NAMES.workspaceHeadingLabel}
                    >
                      Weapon Damage
                    </span>
                    <small
                      className={`${BUILDER_SHELL_CLASS_NAMES.workspaceHeadingMeta} max-tablet:hidden`}
                    >
                      Current loadout
                    </small>
                  </header>
                  <div
                    className={
                      MOBILE_BUILD_DAMAGE_PANELS_CLASS_NAMES[mobileStatsGeometryState]
                    }
                  >
                    <WeaponDamagePanel
                      hand="Main Hand"
                      index={1}
                      mobileHand="Main"
                      mobileStatsState={mobileStatsGeometryState}
                      morphKey="main"
                      virtues={calculation.effectiveVirtues}
                      item={
                        build.equipment.mainHand
                          ? weaponById.get(build.equipment.mainHand)
                          : undefined
                      }
                    />
                    <WeaponDamagePanel
                      hand="Off Hand"
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
                    </div>
                  </section>
                </div>

                <ActiveBuildEffects
                  build={build}
                  mobileStatsState={mobileStatsDetailState}
                />

                {calculation.modifiers.attack > 0 ||
                calculation.modifiers.stagger > 0 ? (
                  <div
                    className={
                      MOBILE_SECONDARY_MODIFIERS_CLASS_NAMES[mobileStatsDetailState]
                    }
                  >
                    {calculation.modifiers.attack > 0 ? (
                      <span className={SECONDARY_MODIFIER_CLASS_NAMES.item}>
                        <small className={SECONDARY_MODIFIER_CLASS_NAMES.label}>
                          Attack
                        </small>
                        <strong className={SECONDARY_MODIFIER_CLASS_NAMES.value}>
                          +{calculation.modifiers.attack}
                        </strong>
                      </span>
                    ) : null}
                    {calculation.modifiers.stagger > 0 ? (
                      <span className={SECONDARY_MODIFIER_CLASS_NAMES.item}>
                        <small className={SECONDARY_MODIFIER_CLASS_NAMES.label}>
                          Stagger
                        </small>
                        <strong className={SECONDARY_MODIFIER_CLASS_NAMES.value}>
                          +{calculation.modifiers.stagger}
                        </strong>
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </aside>
          </div>
        </section>
      </section>

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

      {activeSlot && ARMOR_SLOTS.includes(activeSlot as ArmorSlot) ? (
        <BuilderArmorPicker
          slot={activeSlot as ArmorSlot}
          build={build}
          onClose={closeBuilderModalLayer}
          onEquip={(itemId) => {
            setBuild((current) => ({
              ...current,
              equipment: { ...current.equipment, [activeSlot]: itemId },
            }));
            closeBuilderModalLayer();
          }}
          onUnequip={() => {
            setBuild((current) => {
              const equipment = { ...current.equipment };
              delete equipment[activeSlot];
              return { ...current, equipment };
            });
            closeBuilderModalLayer();
          }}
        />
      ) : null}

      {(activeSlot === "mainHand" || activeSlot === "offHand") &&
      weaponConfigTab === "weapon" ? (
        <BuilderWeaponPicker
          slot={activeSlot}
          build={build}
          onClose={closeBuilderModalLayer}
          onConfigure={(tab, totemSlot) => {
            if (totemSlot !== undefined) setSelectedTotemSlot(totemSlot);
            setWeaponConfigTab(tab);
          }}
          onEquip={(itemId) => {
            const weapon = weaponById.get(itemId);
            const normalized = normalizeWeaponEnhancements(
              build.weaponEnhancements[activeSlot],
              weapon,
              runeById,
            );
            if (normalized.changed) {
              notifyAlert({
                id: "builder.weapon-enhancements-cleared",
                title: "Weapon enhancements adjusted",
                description:
                  "Incompatible Rune or Totem selections were cleared for the new weapon.",
                severity: "warning",
              });
            }
            equipWeapon(activeSlot, itemId, normalized.value);
          }}
          onUnequip={() => {
            const remembered = { ...combatArtLibrary, ...build.combatArts };
            setCombatArtLibrary(remembered);
            setBuild((current) => {
              const equipment = { ...current.equipment };
              delete equipment[activeSlot];
              return withActiveCombatArts(
                {
                  ...current,
                  equipment,
                  weaponEnhancements: {
                    ...current.weaponEnhancements,
                    [activeSlot]: createEmptyWeaponEnhancements(),
                  },
                },
                remembered,
              );
            });
            closeBuilderModalLayer();
          }}
        />
      ) : null}

      {(activeSlot === "mainHand" || activeSlot === "offHand") &&
      weaponConfigTab !== "weapon" ? (
        <BuilderWeaponEnhancementPicker
          slot={activeSlot}
          tab={weaponConfigTab}
          selectedTotemSlot={selectedTotemSlot}
          build={build}
          onClose={closeBuilderModalLayer}
          onTabChange={(tab, totemSlot) => {
            if (totemSlot !== undefined) setSelectedTotemSlot(totemSlot);
            setWeaponConfigTab(tab);
          }}
          onChange={(enhancements) =>
            setBuild((current) => ({
              ...current,
              weaponEnhancements: {
                ...current.weaponEnhancements,
                [activeSlot]: enhancements,
              },
            }))
          }
          onArtAllocationChange={updateCombatArtAllocation}
          onResetArtAllocation={resetCombatArtAllocation}
        />
      ) : null}

      {isPactPickerOpen ? (
        <BuilderPactPicker
          currentId={build.pact.itemId}
          allocations={{
            ...pactArtLibrary,
            ...(build.pact.itemId
              ? { [build.pact.itemId]: build.pact.artAllocation }
              : {}),
          }}
          onClose={closeBuilderModalLayer}
          onEquip={equipPact}
          onAllocationChange={updatePactArtAllocation}
          onResetAllocation={resetPactArtAllocation}
        />
      ) : null}

      {activeSlot === "talisman" ? (
        <BuilderTalismanPicker
          build={build}
          onClose={closeBuilderModalLayer}
          onEquip={(itemId) => {
            setBuild((current) => ({
              ...current,
              equipment: { ...current.equipment, talisman: itemId },
            }));
            closeBuilderModalLayer();
          }}
          onUnequip={() => {
            setBuild((current) => {
              const equipment = { ...current.equipment };
              delete equipment.talisman;
              return { ...current, equipment };
            });
            closeBuilderModalLayer();
          }}
        />
      ) : null}

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
              ? mobileHeaderLayerElement ?? mobileMenuLayerElement
              : undefined
          }
        />
      ) : null}
    </main>
  );
}
