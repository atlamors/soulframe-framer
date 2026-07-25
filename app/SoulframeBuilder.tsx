"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { armorById, armorCatalogue } from "@/src/data/catalogue";
import {
  calculateBuild,
  calculateItemContribution,
} from "@/src/domain/calculation";
import {
  BUILD_SCHEMA_VERSION,
  STORAGE_KEY,
  deserializeBuild,
  parseStoredBuild,
  serializeBuild,
} from "@/src/domain/serialization";
import {
  ARMOR_SLOTS,
  DEFENSE_IDS,
  VIRTUE_IDS,
  type ArmorItem,
  type ArmorSlot,
  type DefenseId,
  type ItemContribution,
  type SoulframeBuild,
  type VirtueId,
} from "@/src/domain/types";

const DEFAULT_BUILD: SoulframeBuild = {
  schemaVersion: BUILD_SCHEMA_VERSION,
  name: "First Envoy",
  virtues: { courage: 12, spirit: 12, grace: 12 },
  equipment: {
    helm: "helm-arbearers-mask",
    cuirass: "cuirass-arbearers-pauncher",
    leggings: "leggings-arbearers-braes",
  },
};

const virtueMeta: Record<
  VirtueId,
  { label: string; icon: string; tone: string }
> = {
  courage: {
    label: "Courage",
    icon: "/icons/courage.png",
    tone: "ember",
  },
  spirit: {
    label: "Spirit",
    icon: "/icons/spirit.png",
    tone: "aether",
  },
  grace: {
    label: "Grace",
    icon: "/icons/grace.png",
    tone: "verdant",
  },
};

const defenseMeta: Record<
  DefenseId,
  { label: string; shortLabel: string; icon: string }
> = {
  physicalDefense: {
    label: "Physical Defense",
    shortLabel: "Physical",
    icon: "/icons/physical-defense.png",
  },
  magickDefense: {
    label: "Magick Defense",
    shortLabel: "Magick",
    icon: "/icons/magick-defense.png",
  },
  stabilityIncrease: {
    label: "Stability Increase",
    shortLabel: "Stability",
    icon: "/icons/stability-increase.png",
  },
};

const slotMeta: Record<
  ArmorSlot,
  { label: string; index: string; prompt: string }
> = {
  helm: { label: "Helm", index: "I", prompt: "Frame the crown" },
  cuirass: { label: "Cuirass", index: "II", prompt: "Frame the core" },
  leggings: { label: "Leggings", index: "III", prompt: "Frame the stride" },
};

function StatIcon({
  src,
  label,
  size = "regular",
}: {
  src: string;
  label: string;
  size?: "small" | "regular" | "large";
}) {
  return (
    <span className={`stat-icon stat-icon-${size}`}>
      {/* The source workbook provides these six canonical icons. */}
      <Image
        src={src}
        alt=""
        aria-hidden="true"
        height={50}
        width={50}
        unoptimized
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

function formatDelta(value: number) {
  if (value > 0) return `+${value}`;
  return String(value);
}

function itemBaseTotal(item: ArmorItem) {
  return DEFENSE_IDS.reduce(
    (total, defense) => total + item.defenses[defense].base,
    0,
  );
}

function EquipmentSlot({
  slot,
  item,
  contribution,
  onOpen,
}: {
  slot: ArmorSlot;
  item?: ArmorItem;
  contribution?: ItemContribution;
  onOpen: () => void;
}) {
  const meta = slotMeta[slot];
  return (
    <button
      type="button"
      className={`equipment-slot equipment-slot-${slot}`}
      onClick={onOpen}
      aria-label={`${meta.label}: ${item?.name ?? "empty"}. Change item.`}
    >
      <span className="slot-index">{meta.index}</span>
      <span className="slot-art" aria-hidden="true">
        <span>{meta.index}</span>
      </span>
      <span className="slot-copy">
        <span className="slot-label">{meta.label}</span>
        <strong>{item?.name ?? meta.prompt}</strong>
        <span className="slot-meta">
          {contribution
            ? `${contribution.total} total defense`
            : "Choose armor"}
        </span>
      </span>
      <span className="slot-action" aria-hidden="true">
        Change <span>↗</span>
      </span>
    </button>
  );
}

function ItemStatDetails({
  item,
  contribution,
  comparison,
}: {
  item: ArmorItem;
  contribution: ItemContribution;
  comparison?: ItemContribution;
}) {
  return (
    <div className="item-stat-table">
      <div className="item-stat-head">
        <span>Defense</span>
        <span>Base</span>
        <span>Scaling</span>
        <span>Final</span>
        {comparison ? <span>Δ</span> : null}
      </div>
      {DEFENSE_IDS.map((defense) => {
        const profile = item.defenses[defense];
        const result = contribution.defenses[defense];
        const delta = comparison
          ? result.total - comparison.defenses[defense].total
          : undefined;
        return (
          <div className="item-stat-row" key={defense}>
            <span className="item-stat-name">
              <StatIcon
                src={defenseMeta[defense].icon}
                label={defenseMeta[defense].label}
                size="small"
              />
              <span>
                {defenseMeta[defense].shortLabel}
                <small>
                  C{profile.pips.courage} · S{profile.pips.spirit} · G
                  {profile.pips.grace}
                </small>
              </span>
            </span>
            <span>{result.base}</span>
            <span>+{result.scaling}</span>
            <strong>{result.total}</strong>
            {delta !== undefined ? (
              <span
                className={
                  delta > 0
                    ? "delta-positive"
                    : delta < 0
                      ? "delta-negative"
                      : "delta-neutral"
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

function ItemPicker({
  slot,
  build,
  onClose,
  onEquip,
  onUnequip,
}: {
  slot: ArmorSlot;
  build: SoulframeBuild;
  onClose: () => void;
  onEquip: (itemId: string) => void;
  onUnequip: () => void;
}) {
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const compatibleItems = useMemo(
    () => armorCatalogue.filter((item) => item.slot === slot),
    [slot],
  );
  const currentItem = build.equipment[slot]
    ? armorById.get(build.equipment[slot]!)
    : undefined;
  const [candidateId, setCandidateId] = useState(
    currentItem?.id ?? compatibleItems[0]?.id,
  );
  const filteredItems = compatibleItems.filter((item) =>
    item.name.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const candidate =
    armorById.get(candidateId) ?? filteredItems[0] ?? compatibleItems[0];
  const currentContribution = currentItem
    ? calculateItemContribution(currentItem, build.virtues)
    : undefined;
  const candidateContribution = candidate
    ? calculateItemContribution(candidate, build.virtues)
    : undefined;

  useEffect(() => {
    searchRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="picker-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="picker-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="picker-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="picker-header">
          <div>
            <span className="eyebrow">Armor catalogue · {slotMeta[slot].index}</span>
            <h2 id="picker-title">Choose {slotMeta[slot].label}</h2>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Close item picker"
          >
            ×
          </button>
        </header>

        <div className="picker-body">
          <aside className="catalogue-column">
            <label className="search-field">
              <span aria-hidden="true">⌕</span>
              <span className="sr-only">Search compatible armor</span>
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`Search ${compatibleItems.length} ${slotMeta[slot].label.toLowerCase()} options`}
              />
            </label>
            <div className="catalogue-count">
              <span>{filteredItems.length} matching pieces</span>
              <span>Verified data</span>
            </div>
            <div className="item-list" role="listbox" aria-label="Compatible armor">
              {filteredItems.map((item) => {
                const isCandidate = item.id === candidate?.id;
                const result = calculateItemContribution(item, build.virtues);
                return (
                  <button
                    type="button"
                    role="option"
                    aria-selected={isCandidate}
                    className={`item-list-row ${isCandidate ? "is-candidate" : ""}`}
                    key={item.id}
                    onClick={() => setCandidateId(item.id)}
                    onFocus={() => setCandidateId(item.id)}
                    onMouseEnter={() => setCandidateId(item.id)}
                  >
                    <span className="item-list-mark">{slotMeta[slot].index}</span>
                    <span>
                      <strong>{item.name}</strong>
                      <small>
                        Base {itemBaseTotal(item)} · Scaled {result.total}
                      </small>
                    </span>
                    {item.id === currentItem?.id ? (
                      <span className="equipped-chip">Equipped</span>
                    ) : (
                      <span className="item-list-total">{result.total}</span>
                    )}
                  </button>
                );
              })}
              {filteredItems.length === 0 ? (
                <div className="empty-search">
                  <span>∅</span>
                  <strong>No armor found</strong>
                  <p>Try a shorter name or clear the search.</p>
                </div>
              ) : null}
            </div>
          </aside>

          <div className="comparison-column">
            {candidate && candidateContribution ? (
              <>
                <div className="comparison-heading">
                  <span className="candidate-art" aria-hidden="true">
                    {slotMeta[slot].index}
                  </span>
                  <div>
                    <span className="eyebrow">Candidate</span>
                    <h3>{candidate.name}</h3>
                    <p>
                      Source: {candidate.provenance.sourceSheet}, row{" "}
                      {candidate.provenance.sourceRow}
                    </p>
                  </div>
                  <span className="verified-badge">Verified</span>
                </div>

                <div className="comparison-context">
                  <span>
                    At C{build.virtues.courage} · S{build.virtues.spirit} · G
                    {build.virtues.grace}
                  </span>
                  <span>
                    {currentItem ? `vs. ${currentItem.name}` : "Empty slot"}
                  </span>
                </div>

                <ItemStatDetails
                  item={candidate}
                  contribution={candidateContribution}
                  comparison={currentContribution}
                />

                <div className="comparison-total">
                  <span>
                    <small>Candidate total</small>
                    <strong>{candidateContribution.total}</strong>
                  </span>
                  {currentContribution ? (
                    <span>
                      <small>Overall change</small>
                      <strong
                        className={
                          candidateContribution.total - currentContribution.total >
                          0
                            ? "delta-positive"
                            : candidateContribution.total -
                                  currentContribution.total <
                                0
                              ? "delta-negative"
                              : "delta-neutral"
                        }
                      >
                        {formatDelta(
                          candidateContribution.total -
                            currentContribution.total,
                        )}
                      </strong>
                    </span>
                  ) : null}
                </div>

                <div className="picker-actions">
                  {currentItem ? (
                    <button
                      type="button"
                      className="button button-quiet"
                      onClick={onUnequip}
                    >
                      Clear slot
                    </button>
                  ) : (
                    <span />
                  )}
                  <button
                    type="button"
                    className="button button-primary"
                    onClick={() => onEquip(candidate.id)}
                    disabled={candidate.id === currentItem?.id}
                  >
                    {candidate.id === currentItem?.id
                      ? "Currently equipped"
                      : `Equip ${slotMeta[slot].label}`}
                  </button>
                </div>
              </>
            ) : (
              <div className="empty-search">
                <span>∅</span>
                <strong>No candidate selected</strong>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export function SoulframeBuilder() {
  const [build, setBuild] = useState<SoulframeBuild>(DEFAULT_BUILD);
  const [activeSlot, setActiveSlot] = useState<ArmorSlot>();
  const [hydrated, setHydrated] = useState(false);
  const [notice, setNotice] = useState<string>();
  const calculation = useMemo(
    () => calculateBuild(build, armorCatalogue),
    [build],
  );

  useEffect(() => {
    let nextBuild: SoulframeBuild | undefined;
    let nextNotice: string | undefined;
    const shared = new URLSearchParams(window.location.search).get("build");
    if (shared) {
      const result = deserializeBuild(shared, armorCatalogue);
      if (result.ok) {
        nextBuild = result.build;
        nextNotice =
          result.warnings.length
            ? `Shared build loaded. ${result.warnings.join(" ")}`
            : "Shared build loaded.";
      } else {
        nextNotice = `Shared build could not be loaded. ${result.error}`;
      }
    } else {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const result = parseStoredBuild(stored, armorCatalogue);
        if (result.ok) {
          nextBuild = result.build;
          if (result.warnings.length) nextNotice = result.warnings.join(" ");
        } else {
          nextNotice =
            "Saved build was invalid, so the default build was restored.";
        }
      }
    }

    const timer = window.setTimeout(() => {
      if (nextBuild) setBuild(nextBuild);
      if (nextNotice) setNotice(nextNotice);
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(build));
  }, [build, hydrated]);

  const updateVirtue = (virtue: VirtueId, amount: number) => {
    const value = Math.min(99, Math.max(0, Math.round(amount || 0)));
    setBuild((current) => ({
      ...current,
      virtues: { ...current.virtues, [virtue]: value },
    }));
  };

  const shareBuild = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set("build", serializeBuild(build));
    try {
      await navigator.clipboard.writeText(url.toString());
      setNotice("Build link copied to your clipboard.");
    } catch {
      window.history.replaceState({}, "", url);
      setNotice("Build link added to the address bar.");
    }
  };

  const resetBuild = () => {
    setBuild(DEFAULT_BUILD);
    setNotice("Default build restored.");
  };

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="topbar">
        <a className="brand" href="#" aria-label="Soulframe Framer home">
          <span className="brand-mark" aria-hidden="true">
            SF
          </span>
          <span>
            <strong>Soulframe</strong>
            <em>Framer</em>
          </span>
        </a>
        <div className="topbar-center">
          <span>Armor study</span>
          <i />
          <span>Verified catalogue</span>
        </div>
        <div className="topbar-actions">
          <button type="button" className="button button-quiet" onClick={resetBuild}>
            Reset
          </button>
          <button
            type="button"
            className="button button-primary"
            onClick={shareBuild}
          >
            Copy build link
          </button>
        </div>
      </header>

      {notice ? (
        <div className="notice" role="status">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(undefined)}>
            Dismiss
          </button>
        </div>
      ) : null}

      <section className="hero-heading">
        <div>
          <span className="eyebrow">Envoy armor configuration</span>
          <input
            className="build-name"
            value={build.name}
            maxLength={80}
            aria-label="Build name"
            onChange={(event) =>
              setBuild((current) => ({ ...current, name: event.target.value }))
            }
          />
          <p>
            Tune your virtues. Read the pips. Frame the defense that follows.
          </p>
        </div>
        <div className="source-note">
          <span className="source-pulse" />
          <span>
            <strong>72 armor pieces</strong>
            <small>Canonical sheet · live export</small>
          </span>
        </div>
      </section>

      <section className="builder-grid">
        <div className="virtues-panel panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Character inputs</span>
              <h2>Virtues</h2>
            </div>
            <span className="panel-number">01</span>
          </div>
          <p className="panel-intro">
            Virtues multiply each armor piece&apos;s attunement pips. They are
            character inputs—not item bonuses.
          </p>
          <div className="virtue-controls">
            {VIRTUE_IDS.map((virtue) => {
              const meta = virtueMeta[virtue];
              return (
                <label className={`virtue-control tone-${meta.tone}`} key={virtue}>
                  <span className="virtue-name">
                    <StatIcon src={meta.icon} label={meta.label} size="large" />
                    <span>
                      <strong>{meta.label}</strong>
                      <small>Character value</small>
                    </span>
                  </span>
                  <span className="virtue-input-wrap">
                    <input
                      type="number"
                      min="0"
                      max="99"
                      value={build.virtues[virtue]}
                      onChange={(event) =>
                        updateVirtue(virtue, Number(event.target.value))
                      }
                    />
                    <span>/ 99</span>
                  </span>
                  <input
                    className="virtue-range"
                    type="range"
                    min="0"
                    max="40"
                    value={Math.min(40, build.virtues[virtue])}
                    aria-label={`${meta.label} quick adjustment`}
                    onChange={(event) =>
                      updateVirtue(virtue, Number(event.target.value))
                    }
                  />
                </label>
              );
            })}
          </div>
          <div className="formula-note">
            <span>Verified rule</span>
            <code>Base + INT(0.12 × weighted pips)</code>
          </div>
        </div>

        <div className="loadout-stage">
          <div className="stage-orbit stage-orbit-one" />
          <div className="stage-orbit stage-orbit-two" />
          <div className="character-focus" aria-label="Neutral character placeholder">
            <div className="character-rune">SF</div>
            <div className="character-silhouette" aria-hidden="true">
              <span className="silhouette-head" />
              <span className="silhouette-body" />
              <span className="silhouette-leg silhouette-leg-left" />
              <span className="silhouette-leg silhouette-leg-right" />
            </div>
            <div className="character-caption">
              <span>Envoy</span>
              <strong>{calculation.total}</strong>
              <small>Total armor</small>
            </div>
          </div>

          {ARMOR_SLOTS.map((slot) => {
            const itemId = build.equipment[slot];
            const item = itemId ? armorById.get(itemId) : undefined;
            const contribution = calculation.items.find(
              (entry) => entry.itemId === itemId,
            );
            return (
              <EquipmentSlot
                key={slot}
                slot={slot}
                item={item}
                contribution={contribution}
                onOpen={() => setActiveSlot(slot)}
              />
            );
          })}
        </div>

        <div className="defense-panel panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Calculated output</span>
              <h2>Armor defense</h2>
            </div>
            <span className="panel-number">02</span>
          </div>

          <div className="total-defense">
            <span>Total armor</span>
            <strong>{calculation.total}</strong>
            <small>Across {calculation.items.length} equipped pieces</small>
          </div>

          <div className="defense-list">
            {DEFENSE_IDS.map((defense) => (
              <div className="defense-row" key={defense}>
                <StatIcon
                  src={defenseMeta[defense].icon}
                  label={defenseMeta[defense].label}
                  size="regular"
                />
                <span>
                  <strong>{defenseMeta[defense].label}</strong>
                  <small>
                    {calculation.items.reduce(
                      (sum, item) => sum + item.defenses[defense].base,
                      0,
                    )}{" "}
                    base · +
                    {calculation.items.reduce(
                      (sum, item) => sum + item.defenses[defense].scaling,
                      0,
                    )}{" "}
                    scaling
                  </small>
                </span>
                <b>{calculation.defenses[defense]}</b>
              </div>
            ))}
          </div>

          <div className="breakdown">
            <div className="breakdown-heading">
              <span>Piece contribution</span>
              <span>Total</span>
            </div>
            {ARMOR_SLOTS.map((slot) => {
              const itemId = build.equipment[slot];
              const item = itemId ? armorById.get(itemId) : undefined;
              const contribution = calculation.items.find(
                (entry) => entry.itemId === itemId,
              );
              return (
                <button
                  type="button"
                  className="breakdown-row"
                  key={slot}
                  onClick={() => setActiveSlot(slot)}
                >
                  <span>
                    <small>{slotMeta[slot].label}</small>
                    <strong>{item?.name ?? "Empty"}</strong>
                  </span>
                  <b>{contribution?.total ?? "—"}</b>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="footer">
        <span>
          Data source: <strong>Soulframe Armor Scaling</strong>
        </span>
        <span>
          Armor requirements are intentionally excluded. No unverified mechanics
          are calculated.
        </span>
      </footer>

      {activeSlot ? (
        <ItemPicker
          slot={activeSlot}
          build={build}
          onClose={() => setActiveSlot(undefined)}
          onEquip={(itemId) => {
            setBuild((current) => ({
              ...current,
              equipment: { ...current.equipment, [activeSlot]: itemId },
            }));
            setActiveSlot(undefined);
          }}
          onUnequip={() => {
            setBuild((current) => {
              const equipment = { ...current.equipment };
              delete equipment[activeSlot];
              return { ...current, equipment };
            });
            setActiveSlot(undefined);
          }}
        />
      ) : null}
    </main>
  );
}
