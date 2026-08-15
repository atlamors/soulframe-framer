"use client";

import {
  getEffectiveWeaponAttunement,
  getJoineryPipApplication,
} from "@/src/domain/weapon-configuration";
import type {
  CraftworkTier,
  Joinery,
  VirtueValues,
  Weapon,
} from "@/src/domain/types";
import {
  RequirementBadge,
  VirtuePipStrip,
} from "../components/primitives";
import { getWeaponDamage } from "../lib/weapon-damage";
import {
  WEAPON_PRIMARY_CLASS_NAMES,
  WEAPON_PRIMARY_META_ROW_CLASS_NAMES,
  WEAPON_PRIMARY_STAT_CLASS_NAMES,
} from "./weaponPrimaryHudClassNames";

export function WeaponPrimaryHud({
  item,
  virtues,
  joinery,
  craftwork = "Stock",
  temperIds = [],
}: {
  item: Weapon;
  virtues: VirtueValues;
  joinery?: Joinery;
  craftwork?: CraftworkTier;
  temperIds?: readonly string[];
}) {
  const damage = getWeaponDamage(
    item,
    virtues,
    joinery,
    craftwork,
    temperIds,
  );
  const effectiveAttunement = getEffectiveWeaponAttunement(
    item.attunement,
    joinery,
  );
  const joineryPipApplication = joinery
    ? getJoineryPipApplication(item.attunement, joinery)
    : undefined;
  const stats = [
    {
      id: "primary",
      label: "Attack",
      bonus: damage.primary.bonus,
      value: damage.primary.total,
    },
    {
      id: "secondary",
      label: damage.secondary.label,
      bonus: damage.secondary.bonus,
      value: damage.secondary.total,
    },
    {
      id: "stagger",
      label: "Stagger",
      bonus: damage.staggerBonus,
      value: damage.stagger,
    },
    {
      id: "smite",
      label: "Smite",
      bonus:
        damage.smite.bonus === undefined
          ? undefined
          : `${damage.smite.bonus}%`,
      value: damage.smite.display,
    },
  ];
  return (
    <section
      className={WEAPON_PRIMARY_CLASS_NAMES.root}
      aria-label="Current weapon damage"
    >
      <header className={WEAPON_PRIMARY_CLASS_NAMES.header}>
        <span>Weapon Damage</span>
      </header>
      <div className={WEAPON_PRIMARY_CLASS_NAMES.grid}>
        {stats.map((stat, index) => (
          <div
            className={
              WEAPON_PRIMARY_STAT_CLASS_NAMES[
                index === stats.length - 1 ? "last" : "default"
              ]
            }
            key={stat.id}
          >
            <small className={WEAPON_PRIMARY_CLASS_NAMES.statLabel}>
              {stat.label}
            </small>
            <span className={WEAPON_PRIMARY_CLASS_NAMES.value}>
              {stat.bonus ? (
                <em className={WEAPON_PRIMARY_CLASS_NAMES.statBonus}>
                  (+{stat.bonus})
                </em>
              ) : null}
              <strong className={WEAPON_PRIMARY_CLASS_NAMES.valueStrong}>
                {stat.value ?? "—"}
              </strong>
            </span>
          </div>
        ))}
      </div>
      <footer className={WEAPON_PRIMARY_CLASS_NAMES.meta}>
        {joinery ? (
          <span className={WEAPON_PRIMARY_CLASS_NAMES.attunementEnhanced}>
            <small className={WEAPON_PRIMARY_CLASS_NAMES.metaLabel}>
              Attunement Pips
            </small>
            <span className={WEAPON_PRIMARY_CLASS_NAMES.attunementRows}>
              <span className={WEAPON_PRIMARY_CLASS_NAMES.attunementBase}>
                <small
                  className={WEAPON_PRIMARY_CLASS_NAMES.attunementRowLabel}
                >
                  Base
                </small>
                <VirtuePipStrip values={item.attunement} />
              </span>
              <span className={WEAPON_PRIMARY_CLASS_NAMES.attunementEffective}>
                <small
                  className={WEAPON_PRIMARY_CLASS_NAMES.attunementSource}
                  title={joinery.name}
                >
                  {joinery.name}
                </small>
                <VirtuePipStrip values={effectiveAttunement} />
                {joineryPipApplication && joineryPipApplication.wasted > 0 ? (
                  <small
                    className={WEAPON_PRIMARY_CLASS_NAMES.attunementWaste}
                  >
                    {joineryPipApplication.applied} applied ·{" "}
                    {joineryPipApplication.wasted} wasted at 5-pip cap
                  </small>
                ) : null}
              </span>
            </span>
          </span>
        ) : (
          <span className={WEAPON_PRIMARY_META_ROW_CLASS_NAMES.default}>
            <small className={WEAPON_PRIMARY_CLASS_NAMES.metaLabel}>
              Attunement Pips
            </small>
            <VirtuePipStrip values={item.attunement} />
          </span>
        )}
        <span className={WEAPON_PRIMARY_META_ROW_CLASS_NAMES.default}>
          <small className={WEAPON_PRIMARY_CLASS_NAMES.metaLabel}>
            Requirement
          </small>
          <RequirementBadge
            item={item}
            virtues={virtues}
            placement="detail"
            showNoRequirement
          />
        </span>
      </footer>
    </section>
  );
}
