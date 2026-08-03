import Image from "next/image";
import { Fragment } from "react";
import type { VirtueValues, Weapon } from "@/src/domain/types";
import type { MobileStatsState } from "../components/mobileWorkspaceClassNames";
import { getWeaponDamageRows } from "../lib/weapon-damage";
import {
  WEAPON_DAMAGE_BONUS_CLASS_NAMES,
  WEAPON_DAMAGE_DIVIDER_CLASS_NAMES,
  WEAPON_DAMAGE_DIVIDER_GRAPHIC_CLASS_NAME,
  WEAPON_DAMAGE_FILIGREE_CLASS_NAMES,
  WEAPON_DAMAGE_HAND_CLASS_NAMES,
  WEAPON_DAMAGE_HAND_TEXT_CLASS_NAMES,
  WEAPON_DAMAGE_HEADER_CLASS_NAMES,
  WEAPON_DAMAGE_INITIAL_CLASS_NAMES,
  WEAPON_DAMAGE_LABEL_CLASS_NAMES,
  WEAPON_DAMAGE_LABEL_TEXT_CLASS_NAMES,
  WEAPON_DAMAGE_NAME_CLASS_NAMES,
  WEAPON_DAMAGE_PANEL_CLASS_NAMES,
  WEAPON_DAMAGE_PRIMARY_ROW_CLASS_NAMES,
  WEAPON_DAMAGE_RANK_CLASS_NAMES,
  WEAPON_DAMAGE_RANK_STARS_CLASS_NAMES,
  WEAPON_DAMAGE_RANK_VALUE_CLASS_NAMES,
  WEAPON_DAMAGE_ROW_CLASS_NAMES,
  WEAPON_DAMAGE_SECONDARY_ROW_CLASS_NAMES,
  WEAPON_DAMAGE_STATS_CLASS_NAMES,
  WEAPON_DAMAGE_SURFACE_CLASS_NAMES,
  WEAPON_DAMAGE_VALUE_CLASS_NAMES,
} from "./weaponDamagePanelClassNames";

function EmphasizedWordInitials({
  initialClassName,
  text,
}: {
  initialClassName: string;
  text: string;
}) {
  return text.split(" ").map((word, index) => (
    <Fragment key={`${word}-${index}`}>
      {index > 0 ? " " : null}
      <span className={initialClassName}>{word.slice(0, 1)}</span>
      {word.slice(1)}
    </Fragment>
  ));
}

export function WeaponDamagePanel({
  hand,
  index,
  item,
  mobileHand,
  mobileStatsState,
  morphKey,
  virtues,
}: {
  hand: "Main Hand" | "Off Hand";
  index: 1 | 2;
  item?: Weapon;
  mobileHand: "Main" | "Sidearm";
  mobileStatsState: MobileStatsState;
  morphKey: "main" | "sidearm";
  virtues: VirtueValues;
}) {
  const stats = getWeaponDamageRows(item, virtues);
  const surfaceGradientId = `weapon-damage-surface-${index}`;
  const surfaceGlowId = `weapon-damage-glow-${index}`;
  const surfaceShadowId = `weapon-damage-shadow-${index}`;
  const dividerGradientId = `weapon-damage-divider-${index}`;
  const surfacePath =
    "M1 2 24 0 48 1.5 72 0.3 99 2 98 23 100 48 98.4 73 99 98 74 97 49 99.5 23 97.5 1 99 1.8 74 0 50 1.5 25Z";

  return (
    <section
      className={WEAPON_DAMAGE_PANEL_CLASS_NAMES[mobileStatsState]}
      aria-label={`${hand} Rank 30 damage for ${item?.name ?? "an empty slot"}.`}
      data-mobile-state={mobileStatsState}
      data-mobile-stats-block={morphKey}
    >
      <svg
        className={WEAPON_DAMAGE_SURFACE_CLASS_NAMES[mobileStatsState]}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id={surfaceGradientId}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0" stopColor="#2b2019" stopOpacity="0.96" />
            <stop offset="0.34" stopColor="#2b2019" stopOpacity="0.96" />
            <stop offset="0.34" stopColor="#30221b" stopOpacity="0.92" />
            <stop offset="1" stopColor="#30221b" stopOpacity="0.92" />
          </linearGradient>
          <radialGradient
            id={surfaceGlowId}
            cx="0.74"
            cy="0.16"
            r="0.58"
          >
            <stop offset="0" stopColor="#7f5929" stopOpacity="0.12" />
            <stop offset="0.49" stopColor="#7f5929" stopOpacity="0" />
          </radialGradient>
          <filter
            id={surfaceShadowId}
            x="-20%"
            y="-20%"
            width="140%"
            height="150%"
          >
            <feDropShadow
              dx="0"
              dy="4"
              stdDeviation="5"
              floodColor="#060403"
              floodOpacity="0.22"
            />
          </filter>
        </defs>
        <g filter={`url(#${surfaceShadowId})`}>
          <path d={surfacePath} fill={`url(#${surfaceGradientId})`} />
          <path d={surfacePath} fill={`url(#${surfaceGlowId})`} />
          <path
            d={surfacePath}
            fill="none"
            stroke="#120e0b"
            strokeOpacity="0.72"
            strokeWidth="2.4"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={surfacePath}
            fill="none"
            stroke="#b98b42"
            strokeOpacity="0.72"
            strokeWidth="0.8"
            vectorEffect="non-scaling-stroke"
          />
        </g>
      </svg>
      <span
        className={WEAPON_DAMAGE_DIVIDER_CLASS_NAMES[mobileStatsState]}
        aria-hidden="true"
      >
        <svg
          className={WEAPON_DAMAGE_DIVIDER_GRAPHIC_CLASS_NAME}
          viewBox="0 0 100 7"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient
              id={dividerGradientId}
              x1="0"
              y1="0"
              x2="1"
              y2="0"
            >
              <stop offset="0" stopColor="#b1853a" stopOpacity="0" />
              <stop offset="0.5" stopColor="#b1853a" stopOpacity="0.48" />
              <stop offset="1" stopColor="#b1853a" stopOpacity="0" />
            </linearGradient>
          </defs>
          <line
            x1="0"
            y1="3.5"
            x2="100"
            y2="3.5"
            stroke={`url(#${dividerGradientId})`}
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </span>
      <header className={WEAPON_DAMAGE_HEADER_CLASS_NAMES[mobileStatsState]}>
        <Image
          className={WEAPON_DAMAGE_FILIGREE_CLASS_NAMES[mobileStatsState]}
          src="/ornaments/damage-panel-filigree.svg"
          alt=""
          aria-hidden="true"
          width={250}
          height={80}
          unoptimized
          data-mobile-stats-filigree
        />
        <span
          className={WEAPON_DAMAGE_HAND_CLASS_NAMES[mobileStatsState]}
          data-mobile-stats-primary
        >
          <span className={WEAPON_DAMAGE_HAND_TEXT_CLASS_NAMES.desktop}>
            {hand}
          </span>
          <span className={WEAPON_DAMAGE_HAND_TEXT_CLASS_NAMES.mobile}>
            {mobileHand}
          </span>
        </span>
        <strong
          className={WEAPON_DAMAGE_NAME_CLASS_NAMES[mobileStatsState]}
          data-mobile-stats-detail
        >
          <EmphasizedWordInitials
            initialClassName={WEAPON_DAMAGE_INITIAL_CLASS_NAMES.name}
            text={item?.name ?? "Unframed"}
          />
        </strong>
        <span
          className={WEAPON_DAMAGE_RANK_CLASS_NAMES[mobileStatsState]}
          aria-hidden="true"
          data-mobile-stats-detail
        >
          <small
            className={
              WEAPON_DAMAGE_RANK_STARS_CLASS_NAMES[mobileStatsState]
            }
          >
            ✦ ✦ ✦
          </small>
          <b
            className={
              WEAPON_DAMAGE_RANK_VALUE_CLASS_NAMES[mobileStatsState]
            }
          >
            {item ? 30 : index === 1 ? "I" : "II"}
          </b>
        </span>
      </header>
      <div className={WEAPON_DAMAGE_STATS_CLASS_NAMES[mobileStatsState]}>
        {stats.map((stat) => {
          const labelVariant =
            stat.id === "charged" ? "charged" : "default";
          const bonusState = stat.bonus ? "visible" : "empty";

          return (
            <div
              className={`${WEAPON_DAMAGE_ROW_CLASS_NAMES[mobileStatsState]} ${
                stat.id === "attack"
                  ? WEAPON_DAMAGE_PRIMARY_ROW_CLASS_NAMES[mobileStatsState]
                  : WEAPON_DAMAGE_SECONDARY_ROW_CLASS_NAMES[mobileStatsState]
              }`}
              data-mobile-stats-detail={
                stat.id === "attack" ? undefined : ""
              }
              key={stat.id}
            >
              <span
                className={
                  WEAPON_DAMAGE_LABEL_CLASS_NAMES[mobileStatsState][
                    labelVariant
                  ]
                }
                data-mobile-stat={stat.id}
                data-mobile-stats-detail={
                  stat.id === "attack" ? "" : undefined
                }
              >
                <span className={WEAPON_DAMAGE_LABEL_TEXT_CLASS_NAMES.desktop}>
                  <EmphasizedWordInitials
                    initialClassName={WEAPON_DAMAGE_INITIAL_CLASS_NAMES.label}
                    text={stat.label}
                  />
                </span>
                <span className={WEAPON_DAMAGE_LABEL_TEXT_CLASS_NAMES.mobile}>
                  <EmphasizedWordInitials
                    initialClassName={WEAPON_DAMAGE_INITIAL_CLASS_NAMES.label}
                    text={labelVariant === "charged" ? "Heavy" : stat.label}
                  />
                </span>
              </span>
              <em
                className={
                  WEAPON_DAMAGE_BONUS_CLASS_NAMES[mobileStatsState][
                    bonusState
                  ]
                }
                aria-hidden="true"
                data-mobile-stats-detail={
                  stat.id === "attack" ? "" : undefined
                }
              >
                {stat.bonus ? `(+${stat.bonus})` : ""}
              </em>
              <strong
                className={
                  WEAPON_DAMAGE_VALUE_CLASS_NAMES[mobileStatsState]
                }
                data-mobile-stats-primary={
                  stat.id === "attack" ? "" : undefined
                }
              >
                {stat.value ?? "—"}
              </strong>
            </div>
          );
        })}
      </div>
    </section>
  );
}
