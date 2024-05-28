import {
  Action,
  ActionReducerMapBuilder,
  PayloadAction,
  isAsyncThunkAction,
  isFulfilled,
  isPending,
  isRejected,
} from "@reduxjs/toolkit";

import { TxLabel } from "@namada/shared";
import {
  CreateToastPayload,
  NotificationsState,
  ToastId,
  ToastTimeout,
} from "./types";

export const DEFAULT_TIMEOUT = 2000;
export const THUNK_MATCH_REGEXP = /^.*(?=\/(pending|fulfilled|rejected)$)/;

export const reducers = {
  createToast: (
    state: NotificationsState,
    action: PayloadAction<CreateToastPayload>
  ) => {
    const { id, data } = action.payload;
    state.toasts = {
      ...state.toasts,
      [id]: {
        title: data.title,
        message: data.message,
        type: data.type,
        timeout: data.timeout || ToastTimeout.Default(),
      },
    };
  },
  removeToast: (
    state: NotificationsState,
    action: PayloadAction<{ id: ToastId }>
  ) => {
    const { [action.payload.id]: _, ...newToasts } = state.toasts;
    state.toasts = newToasts;
  },
  txStartedToast(
    state: NotificationsState,
    action: PayloadAction<{ id: ToastId; txTypeLabel: TxLabel }>
  ) {
    const { id, txTypeLabel } = action.payload;
    state.toasts = {
      ...state.toasts,
      [id]: {
        title: `${txTypeLabel} started`,
        message: "Waiting for confirmation",
        type: "info",
        timeout: ToastTimeout.None(),
      },
    };
  },
  txCompletedToast(
    state: NotificationsState,
    action: PayloadAction<{
      id: ToastId;
      txTypeLabel: TxLabel;
      success: boolean;
      error: string;
    }>
  ) {
    const { error, id, success, txTypeLabel } = action.payload;
    state.toasts = {
      ...state.toasts,
      [id]: {
        title: `${txTypeLabel} ${success ? "confirmed" : "rejected"}`,
        message: success ? "Transaction completed!" : error,
        type: success ? "success" : "error",
        timeout: ToastTimeout.Default(),
      },
    };
  },
};

export const extraReducers = (
  builder: ActionReducerMapBuilder<NotificationsState>
): void => {
  builder.addMatcher(
    isAsyncThunkAction,
    (state: NotificationsState, action: Action) => {
      const [actionType] = action.type.match(THUNK_MATCH_REGEXP) || [];
      const pendingSet = new Set(state.pendingActions);

      if (actionType) {
        if (isPending(action)) {
          pendingSet.add(actionType);
        } else if (isFulfilled(action) || isRejected(action)) {
          pendingSet.delete(actionType);
        }
        state.pendingActions = Array.from(pendingSet);
      }
    }
  );
};
