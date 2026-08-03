export type AlertSeverity = "info" | "warning" | "danger";
export type AlertStatus = "active" | "resolved";

export type AlertPayload = {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  impact?: number;
};

export type AlertRecord = AlertPayload & {
  status: AlertStatus;
  createdAt: number;
  updatedAt: number;
  resolvedAt?: number;
};

export type AlertToast = Pick<
  AlertRecord,
  "id" | "title" | "description" | "severity"
> & {
  toastId: string;
};

export type AlertState = {
  records: AlertRecord[];
  toasts: AlertToast[];
  dismissedToastIds: string[];
};

export type AlertAction =
  | {
      type: "sync";
      alert: AlertPayload & { active: boolean };
      occurredAt: number;
      toastId: string;
      suppressToast?: boolean;
    }
  | {
      type: "notify";
      alert: AlertPayload;
      occurredAt: number;
      toastId: string;
    }
  | { type: "dismissToast"; toastId: string };

export const INITIAL_ALERT_STATE: AlertState = {
  records: [],
  toasts: [],
  dismissedToastIds: [],
};

function upsertRecord(records: AlertRecord[], record: AlertRecord) {
  return [record, ...records.filter((item) => item.id !== record.id)];
}

function upsertToast(
  toasts: AlertToast[],
  alert: AlertPayload,
  toastId: string,
) {
  const toast = {
    toastId,
    id: alert.id,
    title: alert.title,
    description: alert.description,
    severity: alert.severity,
  } satisfies AlertToast;
  const existingIndex = toasts.findIndex((item) => item.toastId === toastId);
  if (existingIndex === -1) return [...toasts, toast];
  return toasts.map((item, index) => (index === existingIndex ? toast : item));
}

export function alertReducer(
  state: AlertState,
  action: AlertAction,
): AlertState {
  if (action.type === "dismissToast") {
    return {
      ...state,
      toasts: state.toasts.filter(
        (toast) => toast.toastId !== action.toastId,
      ),
      dismissedToastIds: state.dismissedToastIds.includes(action.toastId)
        ? state.dismissedToastIds
        : [...state.dismissedToastIds, action.toastId],
    };
  }

  const previous = state.records.find(
    (record) => record.id === action.alert.id,
  );

  if (action.type === "notify") {
    const record: AlertRecord = {
      ...action.alert,
      status: "resolved",
      createdAt: previous?.createdAt ?? action.occurredAt,
      updatedAt: action.occurredAt,
      resolvedAt: action.occurredAt,
    };

    return {
      records: upsertRecord(state.records, record),
      toasts: upsertToast(state.toasts, action.alert, action.toastId),
      dismissedToastIds: state.dismissedToastIds,
    };
  }

  const hasStableLifecycleToast = action.toastId === action.alert.id;

  if (!action.alert.active) {
    const remainingToasts = state.toasts.filter((toast) =>
      hasStableLifecycleToast
        ? toast.id !== action.alert.id
        : toast.toastId !== action.toastId,
    );
    const remainingDismissedToastIds = state.dismissedToastIds.filter(
      (toastId) =>
        toastId !== action.toastId &&
        (!hasStableLifecycleToast ||
          !toastId.startsWith(`${action.alert.id}:`)),
    );

    if (!previous || previous.status === "resolved") {
      if (
        !hasStableLifecycleToast ||
        (remainingToasts.length === state.toasts.length &&
          remainingDismissedToastIds.length ===
            state.dismissedToastIds.length)
      ) {
        return state;
      }
      return {
        ...state,
        toasts: remainingToasts,
        dismissedToastIds: remainingDismissedToastIds,
      };
    }

    const resolvedRecord: AlertRecord = {
      ...previous,
      ...action.alert,
      status: "resolved",
      updatedAt: action.occurredAt,
      resolvedAt: action.occurredAt,
    };

    return {
      ...state,
      records: upsertRecord(state.records, resolvedRecord),
      toasts: remainingToasts,
      dismissedToastIds: remainingDismissedToastIds,
    };
  }

  const hasVisibleToast = state.toasts.some(
    (toast) =>
      hasStableLifecycleToast
        ? toast.id === action.alert.id
        : toast.toastId === action.toastId,
  );
  const shouldToast =
    !action.suppressToast &&
    !state.dismissedToastIds.includes(action.toastId) &&
    (!previous || previous.status === "resolved");
  const activeRecord: AlertRecord = {
    ...action.alert,
    status: "active",
    createdAt: previous?.createdAt ?? action.occurredAt,
    updatedAt: action.occurredAt,
    resolvedAt: undefined,
  };

  const synchronizedToasts = hasStableLifecycleToast
    ? state.toasts.filter(
        (toast) =>
          toast.id !== action.alert.id || toast.toastId === action.toastId,
      )
    : state.toasts;

  return {
    records: upsertRecord(state.records, activeRecord),
    toasts: hasVisibleToast || shouldToast
      ? upsertToast(synchronizedToasts, action.alert, action.toastId)
      : synchronizedToasts,
    dismissedToastIds: state.dismissedToastIds,
  };
}
