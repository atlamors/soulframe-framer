import type { AlertSeverity } from "./alertState";

export const ALERT_ACKNOWLEDGEMENT_STORAGE_KEY =
  "soulframe-framer:alert-acknowledgements";
export const ALERT_ACKNOWLEDGEMENT_VERSION = 2;

export type AlertAcknowledgement = {
  id: string;
  fingerprint: string;
  severity: AlertSeverity;
  muted: boolean;
};

export type AlertAcknowledgementLedger = {
  version: typeof ALERT_ACKNOWLEDGEMENT_VERSION;
  acknowledgements: AlertAcknowledgement[];
};

type StorageAdapter = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function emptyLedger(): AlertAcknowledgementLedger {
  return {
    version: ALERT_ACKNOWLEDGEMENT_VERSION,
    acknowledgements: [],
  };
}

function isSeverity(value: unknown): value is AlertSeverity {
  return value === "info" || value === "warning" || value === "danger";
}

function parseAcknowledgement(value: unknown, fallbackMuted?: boolean) {
  if (!value || typeof value !== "object") return undefined;
  const candidate = value as Record<string, unknown>;
  const muted =
    typeof candidate.muted === "boolean" ? candidate.muted : fallbackMuted;
  if (
    typeof candidate.id !== "string" ||
    !candidate.id ||
    typeof candidate.fingerprint !== "string" ||
    !isSeverity(candidate.severity) ||
    typeof muted !== "boolean"
  ) {
    return undefined;
  }

  return {
    id: candidate.id,
    fingerprint: candidate.fingerprint,
    severity: candidate.severity,
    muted,
  } satisfies AlertAcknowledgement;
}

function normalizeAcknowledgements(value: unknown, fallbackMuted?: boolean) {
  if (!Array.isArray(value)) return [];
  const byId = new Map<string, AlertAcknowledgement>();
  for (const item of value) {
    const acknowledgement = parseAcknowledgement(item, fallbackMuted);
    if (acknowledgement) byId.set(acknowledgement.id, acknowledgement);
  }
  return [...byId.values()];
}

export function parseAlertAcknowledgements(
  serialized: string | null,
): AlertAcknowledgementLedger {
  if (!serialized) return emptyLedger();

  try {
    const parsed = JSON.parse(serialized) as unknown;
    if (!parsed || typeof parsed !== "object") return emptyLedger();
    const candidate = parsed as Record<string, unknown>;

    if (candidate.version === ALERT_ACKNOWLEDGEMENT_VERSION) {
      return {
        version: ALERT_ACKNOWLEDGEMENT_VERSION,
        acknowledgements: normalizeAcknowledgements(
          candidate.acknowledgements,
        ),
      };
    }

    if (candidate.version === 1) {
      return {
        version: ALERT_ACKNOWLEDGEMENT_VERSION,
        acknowledgements: normalizeAcknowledgements(
          candidate.acknowledgements,
          false,
        ),
      };
    }

    if (candidate.version === 0) {
      return {
        version: ALERT_ACKNOWLEDGEMENT_VERSION,
        acknowledgements: normalizeAcknowledgements(candidate.alerts, false),
      };
    }
  } catch {
    return emptyLedger();
  }

  return emptyLedger();
}

export function readAlertAcknowledgements(
  storage?: StorageAdapter,
): AlertAcknowledgementLedger {
  if (!storage) return emptyLedger();
  try {
    return parseAlertAcknowledgements(
      storage.getItem(ALERT_ACKNOWLEDGEMENT_STORAGE_KEY),
    );
  } catch {
    return emptyLedger();
  }
}

export function writeAlertAcknowledgement(
  storage: StorageAdapter | undefined,
  ledger: AlertAcknowledgementLedger,
  acknowledgement: AlertAcknowledgement,
): AlertAcknowledgementLedger {
  const nextLedger = {
    version: ALERT_ACKNOWLEDGEMENT_VERSION,
    acknowledgements: [
      acknowledgement,
      ...ledger.acknowledgements.filter(
        (item) => item.id !== acknowledgement.id,
      ),
    ],
  } satisfies AlertAcknowledgementLedger;

  if (storage) {
    try {
      storage.setItem(
        ALERT_ACKNOWLEDGEMENT_STORAGE_KEY,
        JSON.stringify(nextLedger),
      );
    } catch {
      // Storage may be unavailable or full; in-memory delivery still proceeds.
    }
  }

  return nextLedger;
}

export function removeAlertAcknowledgement(
  storage: StorageAdapter | undefined,
  ledger: AlertAcknowledgementLedger,
  alertId: string,
): AlertAcknowledgementLedger {
  const acknowledgements = ledger.acknowledgements.filter(
    (item) => item.id !== alertId,
  );
  const nextLedger = {
    version: ALERT_ACKNOWLEDGEMENT_VERSION,
    acknowledgements,
  } satisfies AlertAcknowledgementLedger;

  if (storage) {
    try {
      if (acknowledgements.length) {
        storage.setItem(
          ALERT_ACKNOWLEDGEMENT_STORAGE_KEY,
          JSON.stringify(nextLedger),
        );
      } else {
        storage.removeItem(ALERT_ACKNOWLEDGEMENT_STORAGE_KEY);
      }
    } catch {
      // Storage may be unavailable; the in-memory ledger is still cleared.
    }
  }

  return nextLedger;
}
