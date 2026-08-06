"use client";

import { useCallback, useEffect, useId, useRef } from "react";

const MOBILE_HISTORY_MEDIA_QUERY = "(max-width: 960px)";
const MOBILE_HISTORY_STATE_KEY = "__soulframeMobileHistoryLayer";

type MobileHistoryMarker = {
  version: 1;
  token: string;
  layer: string;
  ordinal: number;
  wrappedState?: unknown;
  hasWrappedState?: boolean;
  preservedValue?: unknown;
  hasPreservedValue?: boolean;
};

type LiveLayer = {
  ownerId: string;
  dismiss: () => void;
};

const liveLayers = new Map<string, LiveLayer>();
const ownerTokens = new Map<string, string>();
const liveLayerOrder: string[] = [];
const pendingOwnerReleases = new Map<string, number>();
let isHistoryManagerInitialized = false;
let tokenSequence = 0;
let nextOrdinal = 0;
let currentOrdinal = 0;
let suppressedBackwardPops = 0;

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function readMarker(state: unknown): MobileHistoryMarker | undefined {
  if (!isObjectRecord(state)) return undefined;
  const value = state[MOBILE_HISTORY_STATE_KEY];
  if (
    !isObjectRecord(value) ||
    value.version !== 1 ||
    typeof value.token !== "string" ||
    typeof value.layer !== "string" ||
    typeof value.ordinal !== "number" ||
    !Number.isFinite(value.ordinal)
  ) {
    return undefined;
  }
  return value as MobileHistoryMarker;
}

function addMarker(state: unknown, marker: MobileHistoryMarker): unknown {
  if (!isObjectRecord(state)) {
    return {
      [MOBILE_HISTORY_STATE_KEY]: {
        ...marker,
        hasWrappedState: true,
        wrappedState: state,
      },
    };
  }

  const hasExistingValue = Object.prototype.hasOwnProperty.call(
    state,
    MOBILE_HISTORY_STATE_KEY,
  );
  const existingValue = state[MOBILE_HISTORY_STATE_KEY];
  const shouldPreserveExistingValue =
    hasExistingValue && readMarker(state) === undefined;

  return {
    ...state,
    [MOBILE_HISTORY_STATE_KEY]: {
      ...marker,
      hasPreservedValue: shouldPreserveExistingValue,
      preservedValue: shouldPreserveExistingValue ? existingValue : undefined,
    },
  };
}

function stripMarker(state: unknown): unknown {
  const marker = readMarker(state);
  if (!marker || !isObjectRecord(state)) return state;
  if (marker.hasWrappedState) return marker.wrappedState;

  const nextState = { ...state };
  delete nextState[MOBILE_HISTORY_STATE_KEY];
  if (marker.hasPreservedValue) {
    nextState[MOBILE_HISTORY_STATE_KEY] = marker.preservedValue;
  }
  return nextState;
}

function removeLiveToken(token: string) {
  const layer = liveLayers.get(token);
  if (!layer) return;
  liveLayers.delete(token);
  if (ownerTokens.get(layer.ownerId) === token) {
    ownerTokens.delete(layer.ownerId);
  }
  const orderIndex = liveLayerOrder.lastIndexOf(token);
  if (orderIndex >= 0) liveLayerOrder.splice(orderIndex, 1);
}

function getTopLiveToken() {
  for (let index = liveLayerOrder.length - 1; index >= 0; index -= 1) {
    const token = liveLayerOrder[index];
    if (liveLayers.has(token)) return token;
    liveLayerOrder.splice(index, 1);
  }
  return undefined;
}

function replaceCurrentStateWithoutMarker() {
  const marker = readMarker(window.history.state);
  if (!marker) return;
  window.history.replaceState(
    stripMarker(window.history.state),
    "",
    window.location.href,
  );
}

function normalizeCurrentState() {
  const marker = readMarker(window.history.state);
  if (marker && !liveLayers.has(marker.token)) {
    replaceCurrentStateWithoutMarker();
  }
}

function handlePopState(event: PopStateEvent) {
  const incomingMarker = readMarker(event.state);
  const incomingOrdinal = incomingMarker?.ordinal ?? 0;
  const isBackward = incomingOrdinal < currentOrdinal;

  if (isBackward && suppressedBackwardPops > 0) {
    suppressedBackwardPops -= 1;
  } else if (isBackward) {
    const token = getTopLiveToken();
    const layer = token ? liveLayers.get(token) : undefined;
    if (token && layer) {
      removeLiveToken(token);
      layer.dismiss();
    }
  }

  currentOrdinal = incomingOrdinal;
  if (incomingMarker && !liveLayers.has(incomingMarker.token)) {
    window.history.replaceState(
      stripMarker(event.state),
      "",
      window.location.href,
    );
    if (isBackward) {
      suppressedBackwardPops += 1;
      window.history.back();
    }
  }
}

function ensureHistoryManager() {
  if (isHistoryManagerInitialized || typeof window === "undefined") return;
  isHistoryManagerInitialized = true;
  const marker = readMarker(window.history.state);
  currentOrdinal = marker?.ordinal ?? 0;
  nextOrdinal = currentOrdinal;
  window.addEventListener("popstate", handlePopState);
  normalizeCurrentState();
}

function releaseOwner(ownerId: string, consumeCurrentEntry: boolean) {
  ensureHistoryManager();
  const token = ownerTokens.get(ownerId);
  if (!token) {
    normalizeCurrentState();
    return;
  }

  const ownsCurrentEntry = readMarker(window.history.state)?.token === token;
  removeLiveToken(token);
  if (!ownsCurrentEntry) return;

  if (consumeCurrentEntry) {
    suppressedBackwardPops += 1;
    window.history.back();
  } else {
    replaceCurrentStateWithoutMarker();
  }
}

function syncOwner(
  ownerId: string,
  layer: string,
  shouldOwnEntry: boolean,
  dismiss: () => void,
) {
  ensureHistoryManager();
  const pendingRelease = pendingOwnerReleases.get(ownerId);
  if (pendingRelease !== undefined) {
    window.clearTimeout(pendingRelease);
    pendingOwnerReleases.delete(ownerId);
  }

  const existingToken = ownerTokens.get(ownerId);
  if (!shouldOwnEntry) {
    releaseOwner(ownerId, false);
    return;
  }
  if (existingToken) {
    const existingLayer = liveLayers.get(existingToken);
    if (existingLayer) existingLayer.dismiss = dismiss;
    return;
  }

  normalizeCurrentState();
  tokenSequence += 1;
  nextOrdinal = Math.max(nextOrdinal, currentOrdinal) + 1;
  const token = `${ownerId}:${tokenSequence}`;
  const marker: MobileHistoryMarker = {
    version: 1,
    token,
    layer,
    ordinal: nextOrdinal,
  };
  liveLayers.set(token, { ownerId, dismiss });
  ownerTokens.set(ownerId, token);
  liveLayerOrder.push(token);
  window.history.pushState(
    addMarker(window.history.state, marker),
    "",
    window.location.href,
  );
  currentOrdinal = marker.ordinal;
}

function scheduleOwnerRelease(ownerId: string) {
  const existingTimer = pendingOwnerReleases.get(ownerId);
  if (existingTimer !== undefined) window.clearTimeout(existingTimer);
  const timer = window.setTimeout(() => {
    pendingOwnerReleases.delete(ownerId);
    releaseOwner(ownerId, false);
  }, 0);
  pendingOwnerReleases.set(ownerId, timer);
}

export function useMobileHistoryLayer({
  id,
  isOpen,
  onDismiss,
}: {
  id: string;
  isOpen: boolean;
  onDismiss: () => void;
}) {
  const ownerId = useId();
  const dismissRef = useRef(onDismiss);

  useEffect(() => {
    dismissRef.current = onDismiss;
  }, [onDismiss]);

  const sync = useCallback(() => {
    if (typeof window === "undefined") return;
    syncOwner(
      ownerId,
      id,
      isOpen && window.matchMedia(MOBILE_HISTORY_MEDIA_QUERY).matches,
      () => dismissRef.current(),
    );
  }, [id, isOpen, ownerId]);

  useEffect(() => {
    sync();
  }, [sync]);

  useEffect(() => {
    const mobileQuery = window.matchMedia(MOBILE_HISTORY_MEDIA_QUERY);
    mobileQuery.addEventListener("change", sync);
    return () => mobileQuery.removeEventListener("change", sync);
  }, [sync]);

  useEffect(() => {
    const pendingRelease = pendingOwnerReleases.get(ownerId);
    if (pendingRelease !== undefined) {
      window.clearTimeout(pendingRelease);
      pendingOwnerReleases.delete(ownerId);
    }
    return () => scheduleOwnerRelease(ownerId);
  }, [ownerId]);

  return useCallback(() => {
    dismissRef.current();
    releaseOwner(ownerId, true);
  }, [ownerId]);
}
