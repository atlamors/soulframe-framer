import { describe, expect, it } from "vitest";
import {
  ALERT_ACKNOWLEDGEMENT_STORAGE_KEY,
  ALERT_ACKNOWLEDGEMENT_VERSION,
  parseAlertAcknowledgements,
  readAlertAcknowledgements,
  removeAlertAcknowledgement,
  writeAlertAcknowledgement,
} from "./alertAcknowledgements";

function createStorage(initial?: string) {
  const values = new Map<string, string>();
  if (initial !== undefined) {
    values.set(ALERT_ACKNOWLEDGEMENT_STORAGE_KEY, initial);
  }

  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

const gearAcknowledgement = {
  id: "builder.unmet-gear-requirements",
  fingerprint: "2007",
  severity: "warning" as const,
  muted: false,
};

describe("alert acknowledgement storage", () => {
  it("writes and reads only versioned acknowledgement metadata", () => {
    const storage = createStorage();
    const initial = readAlertAcknowledgements(storage);
    writeAlertAcknowledgement(storage, initial, gearAcknowledgement);

    expect(readAlertAcknowledgements(storage)).toEqual({
      version: ALERT_ACKNOWLEDGEMENT_VERSION,
      acknowledgements: [gearAcknowledgement],
    });
  });

  it("migrates version one acknowledgements as unmuted", () => {
    const legacyAcknowledgement = {
      id: gearAcknowledgement.id,
      fingerprint: gearAcknowledgement.fingerprint,
      severity: gearAcknowledgement.severity,
    };
    const migrated = parseAlertAcknowledgements(
      JSON.stringify({
        version: 1,
        acknowledgements: [legacyAcknowledgement],
      }),
    );

    expect(migrated).toEqual({
      version: ALERT_ACKNOWLEDGEMENT_VERSION,
      acknowledgements: [gearAcknowledgement],
    });
  });

  it("migrates the version zero alert list as unmuted", () => {
    const legacyAcknowledgement = {
      id: gearAcknowledgement.id,
      fingerprint: gearAcknowledgement.fingerprint,
      severity: gearAcknowledgement.severity,
    };
    const migrated = parseAlertAcknowledgements(
      JSON.stringify({ version: 0, alerts: [legacyAcknowledgement] }),
    );

    expect(migrated).toEqual({
      version: ALERT_ACKNOWLEDGEMENT_VERSION,
      acknowledgements: [gearAcknowledgement],
    });
  });

  it("falls back safely for corrupt and unknown-version data", () => {
    expect(parseAlertAcknowledgements("not json").acknowledgements).toEqual([]);
    expect(
      parseAlertAcknowledgements(
        JSON.stringify({ version: 99, acknowledgements: [gearAcknowledgement] }),
      ).acknowledgements,
    ).toEqual([]);
  });

  it("is safe without browser storage", () => {
    expect(readAlertAcknowledgements()).toEqual({
      version: ALERT_ACKNOWLEDGEMENT_VERSION,
      acknowledgements: [],
    });
  });

  it("removes a resolved acknowledgement so reactivation is unacknowledged", () => {
    const storage = createStorage();
    const written = writeAlertAcknowledgement(
      storage,
      readAlertAcknowledgements(storage),
      gearAcknowledgement,
    );
    const cleared = removeAlertAcknowledgement(
      storage,
      written,
      gearAcknowledgement.id,
    );

    expect(cleared.acknowledgements).toEqual([]);
    expect(storage.getItem(ALERT_ACKNOWLEDGEMENT_STORAGE_KEY)).toBeNull();
  });
});
