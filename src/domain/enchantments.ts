import {
  VIRTUE_IDS,
  type VirtueId,
  type Rune,
  type TotemSelection,
  type Weapon,
  type WeaponEnhancements,
} from "./types";

export function createEmptyWeaponEnhancements(): WeaponEnhancements {
  return {
    rune: null,
    totems: [null, null, null, null],
  };
}

export function isRuneCompatible(rune: Rune, weapon?: Weapon) {
  return Boolean(weapon && rune.weaponArt === weapon.combatArt);
}

export function getTotemSlotVirtue(
  index: number,
  rune?: Pick<Rune, "addedSlot">,
): VirtueId | null {
  return index < VIRTUE_IDS.length
    ? VIRTUE_IDS[index]
    : rune?.addedSlot ?? null;
}

export function canEquipTotemInSlot(
  enhancements: WeaponEnhancements,
  itemId: string,
  slotIndex: number,
) {
  return enhancements.totems.every(
    (selection, index) =>
      index === slotIndex || selection?.itemId !== itemId,
  );
}

export function normalizeWeaponEnhancements(
  enhancements: WeaponEnhancements,
  weapon: Weapon | undefined,
  runeById: ReadonlyMap<string, Rune>,
): { value: WeaponEnhancements; changed: boolean } {
  const selectedRune = enhancements.rune
    ? runeById.get(enhancements.rune.itemId)
    : undefined;
  const rune =
    selectedRune && isRuneCompatible(selectedRune, weapon)
      ? enhancements.rune
      : null;
  const seenTotems = new Set<string>();
  const totems = enhancements.totems.map((totem, index) => {
    if (!totem || (index === 3 && !rune) || seenTotems.has(totem.itemId)) {
      return null;
    }
    seenTotems.add(totem.itemId);
    return totem;
  }) as WeaponEnhancements["totems"];
  const value = { rune, totems };
  return {
    value,
    changed:
      rune !== enhancements.rune ||
      totems.some((totem, index) => totem !== enhancements.totems[index]),
  };
}

export function formatTotemEffect(
  effect: string,
  values: Array<number | null>,
) {
  let output = effect;
  values.forEach((value, index) => {
    output = output.replaceAll(
      `$${index + 1}`,
      value === null ? "unknown" : String(value),
    );
  });
  return output;
}

export function getTotemRankValues(
  selection: TotemSelection,
  rankValues: Array<Array<number | null>>,
  gripRankValues: Array<Array<number | null>>,
) {
  const source =
    selection.variant === "combatArt" ? gripRankValues : rankValues;
  return source.map((series) => series[selection.rank] ?? null);
}
