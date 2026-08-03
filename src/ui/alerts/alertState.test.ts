import { describe, expect, it } from "vitest";
import {
  INITIAL_ALERT_STATE,
  alertReducer,
  type AlertPayload,
} from "./alertState";

const gearAlert: AlertPayload = {
  id: "builder.unmet-gear-requirements",
  title: "Gear requirements unmet",
  description: "One equipped item has an unmet requirement.",
  severity: "warning",
  impact: 1,
};

function syncGear(
  state = INITIAL_ALERT_STATE,
  overrides: Partial<AlertPayload & { active: boolean }> = {},
  occurredAt = 1,
) {
  return alertReducer(state, {
    type: "sync",
    alert: { ...gearAlert, active: true, ...overrides },
    occurredAt,
    toastId: gearAlert.id,
  });
}

describe("alertReducer", () => {
  it("creates one active record and one toast on inactive to active", () => {
    const state = syncGear();

    expect(state.records).toHaveLength(1);
    expect(state.records[0]).toMatchObject({
      id: gearAlert.id,
      status: "active",
    });
    expect(state.toasts).toHaveLength(1);
    expect(state.toasts[0].toastId).toBe(gearAlert.id);
  });

  it("restores an unchanged acknowledged alert without replaying its toast", () => {
    const state = alertReducer(INITIAL_ALERT_STATE, {
      type: "sync",
      alert: { ...gearAlert, active: true },
      occurredAt: 2,
      toastId: gearAlert.id,
      suppressToast: true,
    });

    expect(state.records[0]).toMatchObject({
      id: gearAlert.id,
      status: "active",
    });
    expect(state.toasts).toHaveLength(0);
  });

  it("silently upserts an alert that remains active", () => {
    const active = syncGear();
    const updated = syncGear(
      active,
      { description: "The current requirement details changed." },
      2,
    );

    expect(updated.records).toHaveLength(1);
    expect(updated.records[0].description).toBe(
      "The current requirement details changed.",
    );
    expect(updated.toasts).toHaveLength(1);
    expect(updated.toasts[0]).toMatchObject({
      toastId: gearAlert.id,
      description: "The current requirement details changed.",
    });
  });

  it("updates a visible toast in place without re-toasting on worsening", () => {
    const active = syncGear();
    const worsened = syncGear(
      active,
      {
        description: "Two equipped items now have unmet requirements.",
        severity: "danger",
        impact: 2,
      },
      2,
    );

    expect(worsened.records).toHaveLength(1);
    expect(worsened.toasts).toHaveLength(1);
    expect(worsened.toasts[0]).toMatchObject({
      toastId: gearAlert.id,
      description: "Two equipped items now have unmet requirements.",
      severity: "danger",
    });
  });

  it("collapses legacy stacked gear toasts into the stable lifecycle slot", () => {
    const active = syncGear();
    const legacyStack = {
      ...active,
      toasts: [
        { ...active.toasts[0], toastId: `${gearAlert.id}:1` },
        { ...active.toasts[0], toastId: `${gearAlert.id}:2` },
      ],
    };
    const updated = syncGear(
      legacyStack,
      { description: "The current requirement details changed." },
      2,
    );

    expect(updated.toasts).toEqual([
      expect.objectContaining({
        toastId: gearAlert.id,
        description: "The current requirement details changed.",
      }),
    ]);
  });

  it("keeps resolved alerts in recent history and re-toasts on reactivation", () => {
    const active = syncGear();
    const resolved = syncGear(active, { active: false }, 2);
    const reactivated = syncGear(resolved, { active: true }, 3);

    expect(resolved.records[0]).toMatchObject({
      status: "resolved",
      resolvedAt: 2,
    });
    expect(resolved.toasts).toHaveLength(0);
    expect(reactivated.records[0].status).toBe("active");
    expect(reactivated.toasts).toHaveLength(1);
  });

  it("cleans legacy gear toast residue from an already-resolved record", () => {
    const resolved = syncGear(syncGear(), { active: false }, 2);
    const legacyResolvedState = {
      ...resolved,
      toasts: [
        {
          toastId: `${gearAlert.id}:1`,
          id: gearAlert.id,
          title: gearAlert.title,
          description: gearAlert.description,
          severity: gearAlert.severity,
        },
      ],
      dismissedToastIds: [`${gearAlert.id}:2`],
    };
    const cleaned = syncGear(legacyResolvedState, { active: false }, 3);

    expect(cleaned.records[0].status).toBe("resolved");
    expect(cleaned.toasts).toHaveLength(0);
    expect(cleaned.dismissedToastIds).toHaveLength(0);
  });

  it("suppresses further active-cycle updates after dismissal", () => {
    const active = syncGear();
    const dismissed = alertReducer(active, {
      type: "dismissToast",
      toastId: gearAlert.id,
    });
    const changed = syncGear(
      dismissed,
      {
        description: "The active alert changed after dismissal.",
        severity: "danger",
        impact: 3,
      },
      2,
    );

    expect(changed.toasts).toHaveLength(0);
    expect(changed.records).toHaveLength(1);
    expect(changed.records[0].description).toBe(
      "The active alert changed after dismissal.",
    );
  });

  it("deduplicates a repeated notice record while delivering each toast", () => {
    const first = alertReducer(INITIAL_ALERT_STATE, {
      type: "notify",
      alert: {
        id: "builder.share",
        title: "Build link ready",
        description: "Build link copied to your clipboard.",
        severity: "info",
      },
      occurredAt: 1,
      toastId: "toast-1",
    });
    const second = alertReducer(first, {
      type: "notify",
      alert: {
        id: "builder.share",
        title: "Build link ready",
        description: "Build link added to the address bar.",
        severity: "info",
      },
      occurredAt: 2,
      toastId: "toast-2",
    });

    expect(second.records).toHaveLength(1);
    expect(second.records[0].description).toBe(
      "Build link added to the address bar.",
    );
    expect(second.toasts).toHaveLength(2);
  });
});
