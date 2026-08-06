"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Bell, CircleAlert, Info, TriangleAlert, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Toast from "@radix-ui/react-toast";
import { useMobileHistoryLayer } from "@/app/hooks/useMobileHistoryLayer";
import { MobileFullscreenOverlay } from "@/app/components/MobileFullscreenOverlay";
import { MOBILE_FULLSCREEN_OVERLAY_STAGE_CLASS_NAMES } from "@/app/components/mobileFullscreenOverlayClassNames";
import {
  INITIAL_ALERT_STATE,
  alertReducer,
  type AlertPayload,
  type AlertRecord,
  type AlertSeverity,
} from "@/src/ui/alerts/alertState";
import {
  readAlertAcknowledgements,
  removeAlertAcknowledgement,
  writeAlertAcknowledgement,
  type AlertAcknowledgementLedger,
} from "@/src/ui/alerts/alertAcknowledgements";
import {
  ALERT_CLASS_NAMES,
  ALERT_SEVERITY_CLASS_NAMES,
  ALERT_SEVERITY_ICON_CLASS_NAMES,
} from "./alertClassNames";

export const ALERT_CENTER_ID = "alert-center-dialog";
const PERSISTED_GEAR_ALERT_ID = "builder.unmet-gear-requirements";

type AlertsContextValue = {
  activeCount: number;
  closeAlertCenter: () => void;
  isCenterOpen: boolean;
  mobileHeaderLayerElement: HTMLDivElement | null;
  notifyAlert: (alert: AlertPayload) => void;
  openAlertCenter: (opener: HTMLButtonElement) => void;
  setMobileHeaderLayerElement: (element: HTMLDivElement | null) => void;
  syncAlert: (alert: AlertPayload & { active: boolean }) => void;
};

type AlertTriggerClassNames = {
  root: string;
  activeRoot?: string;
  icon: string;
  badge: string;
};

const AlertsContext = createContext<AlertsContextValue | null>(null);

function useAlertsContext() {
  const context = useContext(AlertsContext);
  if (!context) {
    throw new Error("Alerts must be used within AlertsProvider.");
  }
  return context;
}

export function useAlerts() {
  const {
    closeAlertCenter,
    isCenterOpen,
    mobileHeaderLayerElement,
    notifyAlert,
    setMobileHeaderLayerElement,
    syncAlert,
  } = useAlertsContext();
  return {
    closeAlertCenter,
    isCenterOpen,
    mobileHeaderLayerElement,
    notifyAlert,
    setMobileHeaderLayerElement,
    syncAlert,
  };
}

export function AlertCenterTrigger({
  classNames,
  tabIndex,
}: {
  classNames: AlertTriggerClassNames;
  tabIndex?: number;
}) {
  const {
    activeCount,
    closeAlertCenter,
    isCenterOpen,
    openAlertCenter,
  } = useAlertsContext();
  const countLabel = activeCount === 1 ? "1 active alert" : `${activeCount} active alerts`;
  const rootClassName =
    isCenterOpen && classNames.activeRoot
      ? `${classNames.root} ${classNames.activeRoot}`
      : classNames.root;

  return (
    <button
      type="button"
      className={rootClassName}
      aria-label={
        isCenterOpen ? "Close alerts" : `Open alerts. ${countLabel}.`
      }
      aria-haspopup="dialog"
      aria-expanded={isCenterOpen}
      aria-controls={ALERT_CENTER_ID}
      tabIndex={tabIndex}
      onClick={(event) => {
        if (isCenterOpen) {
          closeAlertCenter();
        } else {
          openAlertCenter(event.currentTarget);
        }
      }}
    >
      <Bell className={classNames.icon} aria-hidden="true" />
      {activeCount > 0 ? (
        <span className={`${classNames.badge} rounded-full`} aria-hidden="true">
          {activeCount > 99 ? "99+" : activeCount}
        </span>
      ) : null}
    </button>
  );
}

function AlertSeverityIcon({ severity }: { severity: AlertSeverity }) {
  const className = `${ALERT_CLASS_NAMES.itemIcon} ${ALERT_SEVERITY_ICON_CLASS_NAMES[severity]}`;
  if (severity === "danger") {
    return <CircleAlert className={className} aria-hidden="true" />;
  }
  if (severity === "warning") {
    return <TriangleAlert className={className} aria-hidden="true" />;
  }
  return <Info className={className} aria-hidden="true" />;
}

function AlertList({
  alerts,
  emptyMessage,
  mutedAlertIds,
  onUnmute,
}: {
  alerts: AlertRecord[];
  emptyMessage: string;
  mutedAlertIds: ReadonlySet<string>;
  onUnmute: (alert: AlertRecord) => void;
}) {
  if (!alerts.length) {
    return <p className={ALERT_CLASS_NAMES.empty}>{emptyMessage}</p>;
  }

  return (
    <div className={ALERT_CLASS_NAMES.list}>
      {alerts.map((alert) => {
        const isMuted = mutedAlertIds.has(alert.id);
        return (
          <article className={ALERT_CLASS_NAMES.item} key={alert.id}>
            <AlertSeverityIcon severity={alert.severity} />
            <div className={ALERT_CLASS_NAMES.itemCopy}>
              <h3 className={ALERT_CLASS_NAMES.itemTitle}>{alert.title}</h3>
              <p className={ALERT_CLASS_NAMES.itemDescription}>
                {alert.description}
              </p>
            </div>
            <div className={ALERT_CLASS_NAMES.itemActions}>
              <span className={ALERT_CLASS_NAMES.itemMeta}>
                {alert.status === "active" ? "Active" : "Resolved"}
              </span>
              {isMuted ? (
                <>
                  <span className={ALERT_CLASS_NAMES.itemMuted}>Muted</span>
                  <button
                    type="button"
                    className={ALERT_CLASS_NAMES.itemUnmute}
                    onClick={() => onUnmute(alert)}
                  >
                    Unmute
                  </button>
                </>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function AlertsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(alertReducer, INITIAL_ALERT_STATE);
  const [isCenterOpen, setIsCenterOpen] = useState(false);
  const [mobileHeaderLayerElement, setMobileHeaderLayerElement] =
    useState<HTMLDivElement | null>(null);
  const [mutedAlertIds, setMutedAlertIds] = useState<Set<string>>(new Set());
  const dismissAlertCenter = useCallback(() => setIsCenterOpen(false), []);
  const closeAlertCenter = useMobileHistoryLayer({
    id: "alerts-center",
    isOpen: isCenterOpen,
    onDismiss: dismissAlertCenter,
  });
  const toastSequenceRef = useRef(0);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);
  const acknowledgementsRef = useRef<AlertAcknowledgementLedger | undefined>(
    undefined,
  );
  const pendingGearAlertRef = useRef<
    (AlertPayload & { active: boolean }) | null
  >(null);
  const currentAlerts = state.records.filter(
    (record) => record.status === "active",
  );
  const recentAlerts = state.records.filter(
    (record) => record.status === "resolved",
  );

  const nextToastId = useCallback((alertId: string, stable = false) => {
    if (stable) return alertId;
    toastSequenceRef.current += 1;
    return `${alertId}:${toastSequenceRef.current}`;
  }, []);

  const getBrowserStorage = useCallback(() => {
    try {
      return window.localStorage;
    } catch {
      return undefined;
    }
  }, []);

  const dispatchSyncedAlert = useCallback(
    (
      alert: AlertPayload & { active: boolean },
      suppressToast = false,
    ) => {
      dispatch({
        type: "sync",
        alert,
        occurredAt: Date.now(),
        toastId: nextToastId(
          alert.id,
          alert.id === PERSISTED_GEAR_ALERT_ID,
        ),
        suppressToast,
      });
    },
    [nextToastId],
  );

  const syncPersistedGearAlert = useCallback(
    (alert: AlertPayload & { active: boolean }) => {
      const ledger = acknowledgementsRef.current;
      if (!ledger) {
        pendingGearAlertRef.current = alert;
        return;
      }

      const storage = getBrowserStorage();
      if (!alert.active) {
        const acknowledgement = ledger.acknowledgements.find(
          (item) => item.id === alert.id,
        );
        if (!acknowledgement?.muted) {
          acknowledgementsRef.current = removeAlertAcknowledgement(
            storage,
            ledger,
            alert.id,
          );
        }
        dispatchSyncedAlert(alert);
        return;
      }

      const fingerprint = String(alert.impact ?? "");
      const acknowledgement = ledger.acknowledgements.find(
        (item) => item.id === alert.id,
      );
      const suppressToast = acknowledgement !== undefined;
      const acknowledgementChanged =
        !acknowledgement ||
        acknowledgement.fingerprint !== fingerprint ||
        acknowledgement.severity !== alert.severity;

      if (acknowledgementChanged) {
        acknowledgementsRef.current = writeAlertAcknowledgement(
          storage,
          ledger,
          {
            id: alert.id,
            fingerprint,
            severity: alert.severity,
            muted: acknowledgement?.muted ?? false,
          },
        );
      }
      dispatchSyncedAlert(alert, suppressToast);
    },
    [dispatchSyncedAlert, getBrowserStorage],
  );

  useEffect(() => {
    const ledger = readAlertAcknowledgements(getBrowserStorage());
    acknowledgementsRef.current = ledger;
    const hydrationTimer = window.setTimeout(() => {
      setMutedAlertIds(
        new Set(
          ledger.acknowledgements
            .filter((acknowledgement) => acknowledgement.muted)
            .map((acknowledgement) => acknowledgement.id),
        ),
      );
    }, 0);
    const pendingAlert = pendingGearAlertRef.current;
    pendingGearAlertRef.current = null;
    if (pendingAlert) syncPersistedGearAlert(pendingAlert);
    return () => window.clearTimeout(hydrationTimer);
  }, [getBrowserStorage, syncPersistedGearAlert]);

  const muteAlertType = useCallback(
    (alertId: string) => {
      if (alertId !== PERSISTED_GEAR_ALERT_ID) return;
      const ledger = acknowledgementsRef.current;
      const acknowledgement = ledger?.acknowledgements.find(
        (item) => item.id === alertId,
      );
      if (!ledger || !acknowledgement || acknowledgement.muted) return;

      acknowledgementsRef.current = writeAlertAcknowledgement(
        getBrowserStorage(),
        ledger,
        { ...acknowledgement, muted: true },
      );
      setMutedAlertIds((current) => new Set(current).add(alertId));
    },
    [getBrowserStorage],
  );

  const unmuteAlertType = useCallback(
    (alert: AlertRecord) => {
      const ledger = acknowledgementsRef.current;
      const acknowledgement = ledger?.acknowledgements.find(
        (item) => item.id === alert.id,
      );
      if (!ledger || !acknowledgement?.muted) return;

      acknowledgementsRef.current =
        alert.status === "active"
          ? writeAlertAcknowledgement(getBrowserStorage(), ledger, {
              ...acknowledgement,
              muted: false,
            })
          : removeAlertAcknowledgement(
              getBrowserStorage(),
              ledger,
              alert.id,
            );
      setMutedAlertIds((current) => {
        const next = new Set(current);
        next.delete(alert.id);
        return next;
      });
    },
    [getBrowserStorage],
  );

  const syncAlert = useCallback(
    (alert: AlertPayload & { active: boolean }) => {
      if (alert.id === PERSISTED_GEAR_ALERT_ID) {
        syncPersistedGearAlert(alert);
        return;
      }
      dispatchSyncedAlert(alert);
    },
    [dispatchSyncedAlert, syncPersistedGearAlert],
  );

  const notifyAlert = useCallback(
    (alert: AlertPayload) => {
      dispatch({
        type: "notify",
        alert,
        occurredAt: Date.now(),
        toastId: nextToastId(alert.id),
      });
    },
    [nextToastId],
  );

  const openAlertCenter = useCallback((opener: HTMLButtonElement) => {
    lastTriggerRef.current = opener;
    setIsCenterOpen(true);
  }, []);

  const contextValue = useMemo<AlertsContextValue>(
    () => ({
      activeCount: currentAlerts.length,
      closeAlertCenter,
      isCenterOpen,
      mobileHeaderLayerElement,
      notifyAlert,
      openAlertCenter,
      setMobileHeaderLayerElement,
      syncAlert,
    }),
    [
      closeAlertCenter,
      currentAlerts.length,
      isCenterOpen,
      mobileHeaderLayerElement,
      notifyAlert,
      openAlertCenter,
      syncAlert,
    ],
  );

  return (
    <AlertsContext.Provider value={contextValue}>
      <Toast.Provider duration={6000} label="Alert notification">
        {children}

        <MobileFullscreenOverlay
          open={isCenterOpen}
          onOpenChange={(open) => {
            if (open) {
              setIsCenterOpen(true);
            } else {
              closeAlertCenter();
            }
          }}
          id={ALERT_CENTER_ID}
          triggerRef={lastTriggerRef}
          className={ALERT_CLASS_NAMES.dialogContent}
          overlayClassName={ALERT_CLASS_NAMES.dialogOverlay}
          portalContainer={mobileHeaderLayerElement}
        >
          <header className={ALERT_CLASS_NAMES.dialogHeader}>
            <div className={ALERT_CLASS_NAMES.dialogHeading}>
              <Dialog.Title className={ALERT_CLASS_NAMES.dialogTitle}>
                Alerts
              </Dialog.Title>
              <Dialog.Description
                className={ALERT_CLASS_NAMES.dialogDescription}
              >
                Current issues and notices from this session.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className={ALERT_CLASS_NAMES.dialogClose}
                aria-label="Close alerts"
              >
                <X
                  className={ALERT_CLASS_NAMES.dialogCloseIcon}
                  aria-hidden="true"
                />
              </button>
            </Dialog.Close>
          </header>
          <div className={ALERT_CLASS_NAMES.dialogBody}>
            <section
              className={`${ALERT_CLASS_NAMES.section} ${MOBILE_FULLSCREEN_OVERLAY_STAGE_CLASS_NAMES.first}`}
            >
              <h2 className={ALERT_CLASS_NAMES.sectionHeading}>Current</h2>
              <AlertList
                alerts={currentAlerts}
                emptyMessage="No active alerts."
                mutedAlertIds={mutedAlertIds}
                onUnmute={unmuteAlertType}
              />
            </section>
            <section
              className={`${ALERT_CLASS_NAMES.section} ${MOBILE_FULLSCREEN_OVERLAY_STAGE_CLASS_NAMES.second}`}
            >
              <h2 className={ALERT_CLASS_NAMES.sectionHeading}>Recent</h2>
              <AlertList
                alerts={recentAlerts}
                emptyMessage="No resolved alerts or recent notices yet."
                mutedAlertIds={mutedAlertIds}
                onUnmute={unmuteAlertType}
              />
            </section>
          </div>
        </MobileFullscreenOverlay>

        {state.toasts.map((toast) => (
          <Toast.Root
            className={`${ALERT_CLASS_NAMES.toast} ${ALERT_SEVERITY_CLASS_NAMES[toast.severity]}`}
            key={toast.toastId}
            type="foreground"
            onOpenChange={(open) => {
              if (!open) {
                dispatch({ type: "dismissToast", toastId: toast.toastId });
              }
            }}
          >
            <Toast.Title className={ALERT_CLASS_NAMES.toastTitle}>
              {toast.title}
            </Toast.Title>
            <Toast.Description className={ALERT_CLASS_NAMES.toastDescription}>
              {toast.description}
            </Toast.Description>
            <Toast.Close
              className={ALERT_CLASS_NAMES.toastClose}
              aria-label={
                toast.id === PERSISTED_GEAR_ALERT_ID
                  ? "Mute gear requirement notifications"
                  : "Dismiss notification"
              }
              onClick={() => muteAlertType(toast.id)}
            >
              <X
                className={ALERT_CLASS_NAMES.toastCloseIcon}
                aria-hidden="true"
              />
            </Toast.Close>
          </Toast.Root>
        ))}
        <Toast.Viewport className={ALERT_CLASS_NAMES.toastViewport} />
      </Toast.Provider>
    </AlertsContext.Provider>
  );
}
