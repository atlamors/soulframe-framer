import Image from "next/image";
import { VirtueAlignmentPreview } from "@/app/builder/affinity/VirtueAlignment";
import { getCombatArtSummaryEntries } from "@/app/builder/arts/CombatArtsSummary";
import { PactFrame } from "@/app/builder/components/PactFrame";
import {
  ArmorArtwork,
  RequirementBadge,
  TalismanArtwork,
  WeaponArtwork,
} from "@/app/builder/components/primitives";
import { defenseMeta, slotMeta, virtueMeta, weaponSlotMeta } from "@/app/builder/constants";
import { CalculatedResultsModule } from "@/app/builder/stats/CalculatedResultsModule";
import { armorById, armorCatalogue } from "@/src/data/catalogue";
import { pactArtTreeByPactId } from "@/src/data/arts";
import { pactAbilityById, pactById } from "@/src/data/pacts";
import { getRuneDisplayName, runeById } from "@/src/data/runes";
import { talismanById, talismanCatalogue } from "@/src/data/talismans";
import { totemById } from "@/src/data/totems";
import { weaponById } from "@/src/data/weapons";
import { PACT_ART_BONUS_BY_RANK } from "@/src/domain/affinity";
import { getArtPointsSpent } from "@/src/domain/arts";
import { calculateBuild } from "@/src/domain/calculation";
import {
  ARMOR_SLOTS,
  DEFENSE_IDS,
  VIRTUE_IDS,
  WEAPON_HAND_SLOTS,
  type SoulframeBuild,
  type VirtueId,
  type WeaponHandSlot,
} from "@/src/domain/types";
import { SectionFrame } from "../editor/SectionFrame";

const FOUNDATION_VIRTUE_ORDER = ["spirit", "grace", "courage"] as const;
const PUBLIC_HAND_LABELS = {
  mainHand: "Main Hand",
  offHand: "Off Hand",
} as const satisfies Record<WeaponHandSlot, string>;
const PUBLIC_PACT_ABILITY_CLASS_NAMES = {
  courage: "border-ember/75",
  spirit: "border-aether/75",
  grace: "border-verdant/75",
  passive: "border-frame-line/30",
} as const;

function SourceValue({ virtue }: { virtue: VirtueId | null }) {
  if (!virtue) return <span className="text-ink-muted">None</span>;
  const meta = virtueMeta[virtue];
  return (
    <span className="inline-flex items-center gap-1.5 text-ink-soft">
      <Image src={meta.icon} alt="" width={16} height={16} unoptimized />
      {meta.label}
    </span>
  );
}

function PublicFoundation({
  build,
  calculation,
}: {
  build: SoulframeBuild;
  calculation: ReturnType<typeof calculateBuild>;
}) {
  const pact = build.pact.itemId ? pactById.get(build.pact.itemId) : undefined;
  const artPoints = pact
    ? getArtPointsSpent(
        pactArtTreeByPactId.get(pact.id)?.nodes ?? [],
        build.pact.artAllocation,
      )
    : 0;
  const baseAffinity = VIRTUE_IDS.reduce(
    (total, virtue) => total + build.virtues[virtue],
    0,
  );

  return (
    <SectionFrame title="Pact & Affinity">
      <div className="grid min-w-0 gap-4 compact-desktop:grid-cols-2">
        <div className="grid min-w-0 gap-3">
          <article className="relative grid min-h-40 min-w-0 grid-cols-[5rem_minmax(0,1fr)] gap-x-4 gap-y-3 overflow-hidden rounded-sm border border-gold/45 bg-surface-deep/55 p-4">
            <PactFrame appearance="neutral" />
            <div className="relative z-10 flex size-20 items-center justify-center self-center overflow-hidden rounded-sm border border-line/45 bg-aura-gold" aria-hidden="true">
              {pact?.image ? (
                <Image
                  src={pact.image.thumbnailUrl}
                  alt=""
                  width={80}
                  height={80}
                  unoptimized
                  className="size-full object-contain drop-shadow-art-strong saturate-95 contrast-110"
                />
              ) : (
                <span className="font-display text-2xl text-gold">✦</span>
              )}
            </div>
            <div className="relative z-10 min-w-0 self-center">
              <small className="font-sans text-2xs font-bold uppercase tracking-[0.14em] text-gold">
                Envoy Pact
              </small>
              <h3 className="mt-1 truncate font-display text-2xl text-gold-bright">
                {pact?.name ?? "No Pact selected"}
              </h3>
              <p className="mt-1 font-sans text-xs text-ink-muted">
                {pact ? `${pact.variant === "wyld" ? "Wyld Pact" : "Pact"} · ${artPoints} Arts` : "Unframed"}
              </p>
            </div>
            {pact?.abilityIds.length ? (
              <div className="relative z-10 col-span-2 grid grid-cols-5 gap-2" aria-label={`${pact.name} abilities`}>
                {pact.abilityIds.map((abilityId) => {
                  const ability = pactAbilityById.get(abilityId);
                  const abilityState = ability?.assignedVirtue ?? "passive";
                  return (
                    <span
                      key={abilityId}
                      className={`flex min-h-11 min-w-0 items-center gap-2 rounded-sm border bg-surface-deep/75 p-1.5 shadow-control ${PUBLIC_PACT_ABILITY_CLASS_NAMES[abilityState]}`}
                      title={ability?.name}
                    >
                      {ability?.image ? (
                        <Image
                          src={ability.image.thumbnailUrl}
                          alt=""
                          width={34}
                          height={34}
                          unoptimized
                          className="mx-auto size-8 object-contain drop-shadow-art-strong"
                        />
                      ) : (
                        <span className="mx-auto text-gold">•</span>
                      )}
                      <span className="sr-only">{ability?.name ?? "Unknown ability"}</span>
                    </span>
                  );
                })}
              </div>
            ) : null}
          </article>

          <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-sm border border-line/35 bg-line/35">
            <div className="bg-control/35 px-3 py-2.5">
              <dt className="font-sans text-2xs font-bold uppercase tracking-wide text-ink-muted">Envoy Rank</dt>
              <dd className="mt-1 font-display text-lg text-gold-bright">{build.affinitySources.envoyRank}</dd>
            </div>
            <div className="bg-control/35 px-3 py-2.5">
              <dt className="font-sans text-2xs font-bold uppercase tracking-wide text-ink-muted">Shewolf</dt>
              <dd className="mt-1 font-sans text-xs"><SourceValue virtue={build.affinitySources.fables.shewolf} /></dd>
            </div>
            <div className="bg-control/35 px-3 py-2.5">
              <dt className="font-sans text-2xs font-bold uppercase tracking-wide text-ink-muted">Waste Bear</dt>
              <dd className="mt-1 font-sans text-xs"><SourceValue virtue={build.affinitySources.fables.wasteBear} /></dd>
            </div>
          </dl>
        </div>

        <article className="grid min-w-0 grid-cols-[minmax(8rem,0.9fr)_minmax(9rem,1.1fr)] items-center gap-3 rounded-sm border border-line/40 bg-surface-deep/40 p-3 max-mobile-wide:grid-cols-1">
          <div className="mx-auto flex aspect-square w-full max-w-44 items-center justify-center overflow-visible" aria-hidden="true">
            <div className="scale-[4]">
              <VirtueAlignmentPreview virtues={build.virtues} />
            </div>
          </div>
          <div className="min-w-0">
            <div className="border-b border-line/35 pb-2">
              <small className="font-sans text-2xs font-bold uppercase tracking-wide text-ink-muted">Base Affinity Points</small>
              <strong className="mt-1 block font-display text-3xl font-normal leading-none text-gold-bright">{baseAffinity}</strong>
            </div>
            <dl className="mt-2 grid gap-1.5">
              {FOUNDATION_VIRTUE_ORDER.map((virtue) => {
                const bonus = calculation.bonusVirtues[virtue];
                return (
                  <div key={virtue} className="flex items-center justify-between gap-3 rounded-sm bg-control/30 px-2.5 py-1.5">
                    <dt className="font-sans text-xs font-bold text-ink-soft">{virtueMeta[virtue].label}</dt>
                    <dd className="font-display text-lg leading-none text-ink">
                      {calculation.effectiveVirtues[virtue]}
                      {bonus > 0 ? <small className="ml-1 font-sans text-2xs text-gold">+{bonus}</small> : null}
                    </dd>
                  </div>
                );
              })}
            </dl>
            <div className="mt-2 border-t border-line/35 pt-2">
              <small className="font-sans text-2xs font-bold uppercase tracking-wide text-ink-muted">Pact Bond</small>
              <div className="mt-1 flex flex-wrap gap-2">
                {VIRTUE_IDS.map((virtue) => (
                  <span key={virtue} className="font-sans text-xs text-ink-soft">
                    {virtueMeta[virtue].label} +{PACT_ART_BONUS_BY_RANK[build.affinitySources.pactArts[virtue]]}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </article>
      </div>
    </SectionFrame>
  );
}

function PublicEquipment({
  build,
  calculation,
}: {
  build: SoulframeBuild;
  calculation: ReturnType<typeof calculateBuild>;
}) {
  const talismanId = build.equipment.talisman;
  const talisman = talismanId ? talismanById.get(talismanId) : undefined;

  return (
    <SectionFrame title="Equipment">
      <div className="grid grid-cols-1 gap-2 mobile-wide:grid-cols-2">
        {ARMOR_SLOTS.map((slot) => {
          const itemId = build.equipment[slot];
          const item = itemId ? armorById.get(itemId) : undefined;
          const contribution = item
            ? calculation.items.find((candidate) => candidate.itemId === item.id)
            : undefined;
          return (
            <article key={slot} className="relative grid min-h-32 min-w-0 grid-cols-[5.5rem_minmax(0,1fr)] gap-3 overflow-hidden rounded-sm border border-line/45 bg-surface-deep/50 p-3">
              <div className="flex min-h-24 items-center justify-center overflow-hidden rounded-sm bg-control/30" aria-hidden="true">
                <ArmorArtwork item={item} fallback={slotMeta[slot].index} sizes="88px" />
              </div>
              <div className="min-w-0 self-center">
                <small className="font-sans text-2xs font-bold uppercase tracking-[0.12em] text-gold">{slotMeta[slot].label}</small>
                <h3 className="mt-1 truncate font-display text-lg text-ink">{item?.name ?? "Empty slot"}</h3>
                {contribution ? (
                  <dl className="mt-2 grid grid-cols-3 gap-1">
                    {DEFENSE_IDS.map((defense) => (
                      <div key={defense} className="rounded-sm bg-control/35 px-1.5 py-1 text-center" title={defenseMeta[defense].label}>
                        <dt className="sr-only">{defenseMeta[defense].label}</dt>
                        <dd className="font-sans text-xs font-bold text-ink-soft">{contribution.defenses[defense].total}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
                {item ? <div className="mt-2"><RequirementBadge item={item} virtues={calculation.effectiveVirtues} placement="dense" /></div> : null}
              </div>
            </article>
          );
        })}

        <article className="relative grid min-h-32 min-w-0 grid-cols-[5.5rem_minmax(0,1fr)] gap-3 overflow-hidden rounded-sm border border-line/45 bg-surface-deep/50 p-3">
          <div className="flex min-h-24 items-center justify-center overflow-hidden rounded-sm bg-control/30" aria-hidden="true">
            <TalismanArtwork item={talisman} sizes="88px" />
          </div>
          <div className="min-w-0 self-center">
            <small className="font-sans text-2xs font-bold uppercase tracking-[0.12em] text-gold">Talisman</small>
            <h3 className="mt-1 truncate font-display text-lg text-ink">{talisman?.name ?? "Empty slot"}</h3>
            {talisman ? (
              <dl className="mt-2 flex flex-wrap gap-2">
                {VIRTUE_IDS.flatMap((virtue) =>
                  talisman.stats.virtues[virtue] > 0
                    ? [
                        <div key={virtue} className="rounded-sm bg-control/35 px-2 py-1">
                          <dt className="sr-only">{virtueMeta[virtue].label}</dt>
                          <dd className="font-sans text-xs font-bold text-ink-soft">{virtueMeta[virtue].label} +{talisman.stats.virtues[virtue]}</dd>
                        </div>,
                      ]
                    : [],
                )}
              </dl>
            ) : null}
          </div>
        </article>
      </div>
    </SectionFrame>
  );
}

function WeaponSupport({
  label,
  name,
  imageUrl,
  rank,
  locked = false,
}: {
  label: string;
  name: string;
  imageUrl?: string;
  rank?: number;
  locked?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-sm border border-line/35 bg-control/30 p-2" data-locked={locked || undefined}>
      <div className="flex min-h-9 items-center gap-2">
        {imageUrl ? <Image src={imageUrl} alt="" width={32} height={32} unoptimized className="size-8 flex-none object-contain" /> : <span className="flex size-8 flex-none items-center justify-center text-ink-faint" aria-hidden="true">{locked ? "×" : "◇"}</span>}
        <span className="min-w-0">
          <small className="block font-sans text-[0.625rem] font-bold uppercase tracking-wide text-ink-muted">{label}</small>
          <strong className="block truncate font-sans text-xs text-ink-soft">{name}</strong>
          {rank !== undefined ? <em className="block font-sans text-[0.625rem] not-italic text-gold">Rank {rank}</em> : null}
        </span>
      </div>
    </div>
  );
}

function PublicWeaponHand({
  build,
  slot,
  virtues,
}: {
  build: SoulframeBuild;
  slot: WeaponHandSlot;
  virtues: SoulframeBuild["virtues"];
}) {
  const weaponId = build.equipment[slot];
  const weapon = weaponId ? weaponById.get(weaponId) : undefined;
  const enhancements = build.weaponEnhancements[slot];
  const rune = enhancements.rune ? runeById.get(enhancements.rune.itemId) : undefined;

  return (
    <article className="min-w-0 rounded-sm border border-line/45 bg-surface-deep/50 p-3" aria-label={`${PUBLIC_HAND_LABELS[slot]} loadout`}>
      <div className="grid min-w-0 grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-3 border-b border-line/35 pb-3">
        <div className="flex min-h-24 items-center justify-center overflow-hidden rounded-sm bg-control/30" aria-hidden="true">
          <WeaponArtwork item={weapon} fallback={weaponSlotMeta[slot].index} sizes="88px" appearance="equipment" />
        </div>
        <div className="min-w-0">
          <small className="font-sans text-2xs font-bold uppercase tracking-[0.12em] text-gold">{PUBLIC_HAND_LABELS[slot]}</small>
          <h3 className="mt-1 truncate font-display text-xl text-ink">{weapon?.name ?? "Unframed"}</h3>
          <p className="mt-1 truncate font-sans text-xs text-ink-muted">{weapon?.combatArt ?? "No weapon selected"}</p>
          {weapon ? <div className="mt-2"><RequirementBadge item={weapon} virtues={virtues} placement="dense" /></div> : null}
        </div>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 tablet:grid-cols-5">
        <WeaponSupport label="Rune" name={rune ? getRuneDisplayName(rune) : "Empty"} imageUrl={rune?.image?.thumbnailUrl} rank={enhancements.rune?.rank} />
        {enhancements.totems.map((selection, index) => {
          const totem = selection ? totemById.get(selection.itemId) : undefined;
          const locked = index === 3 && !rune;
          return (
            <WeaponSupport
              key={index}
              label={`Totem ${index + 1}`}
              name={locked ? "Locked" : totem?.name ?? "Empty"}
              imageUrl={totem?.image?.thumbnailUrl}
              rank={selection?.rank}
              locked={locked}
            />
          );
        })}
      </div>
    </article>
  );
}

function PublicWeapons({
  build,
  calculation,
}: {
  build: SoulframeBuild;
  calculation: ReturnType<typeof calculateBuild>;
}) {
  const arts = getCombatArtSummaryEntries(build);
  return (
    <SectionFrame title="Weapons">
      <div className="grid min-w-0 grid-cols-1 gap-2 mobile-wide:grid-cols-2">
        {WEAPON_HAND_SLOTS.map((slot) => (
          <PublicWeaponHand
            key={slot}
            build={build}
            slot={slot}
            virtues={calculation.effectiveVirtues}
          />
        ))}
      </div>
      {arts.length ? (
        <section className="mt-4 border-t border-line/35 pt-3" aria-label="Combat Arts">
          <h3 className="font-sans text-xs font-bold uppercase tracking-[0.1em] text-ink-soft">Combat Arts</h3>
          <div className="mt-2 grid grid-cols-1 gap-2 mobile-wide:grid-cols-2">
            {arts.map((art) => (
              <article key={art.name} className="rounded-sm border border-line/40 bg-surface-deep/45 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="truncate font-display text-lg text-gold-bright">{art.name}</h4>
                    <p className="mt-0.5 font-sans text-2xs font-bold uppercase tracking-wide text-ink-muted">
                      {art.sourceSlots.map((slot) => PUBLIC_HAND_LABELS[slot]).join(" + ")}
                    </p>
                  </div>
                  <div className="flex-none text-right">
                    <strong className="font-display text-2xl font-normal leading-none text-ink">{art.pointsSpent}</strong>
                    <small className="block font-sans text-[0.625rem] font-bold uppercase tracking-wide text-ink-muted">Points</small>
                  </div>
                </div>
                <div className="mt-2 border-t border-line/30 pt-2">
                  {art.allocatedRanks.length ? (
                    <ul className="space-y-1">
                      {art.allocatedRanks.map((rank) => (
                        <li key={rank.nodeId} className="flex items-baseline justify-between gap-2 font-sans text-xs text-ink-soft">
                          <span>{rank.outcome ?? rank.name}</span>
                          <small className="flex-none text-ink-muted">Rank {rank.rank}/{rank.maxRank}</small>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="font-sans text-xs text-ink-muted">No ranks allocated</p>}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </SectionFrame>
  );
}

export function PublicBuildStageModules({ build }: { build: SoulframeBuild }) {
  const calculation = calculateBuild(build, armorCatalogue, talismanCatalogue);
  return (
    <div className="space-y-5">
      <PublicFoundation build={build} calculation={calculation} />
      <PublicEquipment build={build} calculation={calculation} />
      <PublicWeapons build={build} calculation={calculation} />
      <CalculatedResultsModule build={build} calculation={calculation} />
    </div>
  );
}
