import { Fragment } from "react";
import type { VirtueValues, Weapon } from "@/src/domain/types";
import type { MobileStatsState } from "../components/mobileWorkspaceClassNames";
import { getWeaponDamageRows } from "../lib/weapon-damage";
import {
  WEAPON_DAMAGE_BONUS_CLASS_NAMES,
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
  WEAPON_DAMAGE_RESULT_CLASS_NAMES,
  WEAPON_DAMAGE_ROW_CLASS_NAMES,
  WEAPON_DAMAGE_SECONDARY_ROW_CLASS_NAMES,
  WEAPON_DAMAGE_STATS_CLASS_NAMES,
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
  hand: "Sidearm" | "Weapon";
  index: 1 | 2;
  item?: Weapon;
  mobileHand: "Sidearm" | "Weapon";
  mobileStatsState: MobileStatsState;
  morphKey: "main" | "sidearm";
  virtues: VirtueValues;
}) {
  const stats = getWeaponDamageRows(item, virtues);

  return (
    <section
      className={WEAPON_DAMAGE_PANEL_CLASS_NAMES[mobileStatsState]}
      aria-label={`${hand} Rank 30 damage for ${item?.name ?? "an empty slot"}.`}
      data-mobile-state={mobileStatsState}
      data-mobile-stats-block={morphKey}
    >
      <header className={WEAPON_DAMAGE_HEADER_CLASS_NAMES[mobileStatsState]}>
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
          const bonusState =
            stat.bonus !== undefined ? "visible" : "empty";

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
                    text={
                      labelVariant === "charged" ? "Charged Attack" : stat.label
                    }
                  />
                </span>
              </span>
              <span
                className={
                  WEAPON_DAMAGE_RESULT_CLASS_NAMES[mobileStatsState]
                }
              >
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
                  {stat.bonus !== undefined ? `(+${stat.bonus})` : ""}
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
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
