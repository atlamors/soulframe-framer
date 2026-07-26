import { describe, expect, it } from "vitest";
import {
  distributeVirtueTotal,
  getVirtueAlignmentPoint,
  shiftVirtueAlignment,
  virtuesFromAlignmentPoint,
} from "./virtue-alignment";

describe("virtue alignment", () => {
  it("preserves the requested total while retaining the current ratio", () => {
    const result = distributeVirtueTotal(47, {
      courage: 12,
      spirit: 12,
      grace: 12,
    });

    expect(result).toEqual({ courage: 16, spirit: 16, grace: 15 });
    expect(result.courage + result.spirit + result.grace).toBe(47);
  });

  it("uses a balanced ratio when increasing an empty pool", () => {
    expect(
      distributeVirtueTotal(30, { courage: 0, spirit: 0, grace: 0 }),
    ).toEqual({ courage: 10, spirit: 10, grace: 10 });
  });

  it("clamps the total pool to the supported maximum", () => {
    const result = distributeVirtueTotal(500, {
      courage: 1,
      spirit: 0,
      grace: 0,
    });

    expect(result).toEqual({ courage: 99, spirit: 0, grace: 0 });
  });

  it("maps each triangle corner to its corresponding virtue", () => {
    expect(virtuesFromAlignmentPoint(45, 0.5, 0)).toEqual({
      courage: 0,
      spirit: 45,
      grace: 0,
    });
    expect(virtuesFromAlignmentPoint(45, 0, 1)).toEqual({
      courage: 45,
      spirit: 0,
      grace: 0,
    });
    expect(virtuesFromAlignmentPoint(45, 1, 1)).toEqual({
      courage: 0,
      spirit: 0,
      grace: 45,
    });
  });

  it("round-trips a virtue ratio through the alignment point", () => {
    const virtues = { courage: 18, spirit: 9, grace: 12 };
    const point = getVirtueAlignmentPoint(virtues);

    expect(virtuesFromAlignmentPoint(39, point.x, point.y)).toEqual(virtues);
  });

  it("moves one conserved point toward a keyboard-selected virtue", () => {
    expect(
      shiftVirtueAlignment(
        { courage: 12, spirit: 12, grace: 12 },
        "spirit",
      ),
    ).toEqual({ courage: 11, spirit: 13, grace: 12 });
  });
});
