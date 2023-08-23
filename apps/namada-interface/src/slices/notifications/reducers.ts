import {
  PayloadAction,
  isPending,
  isFulfilled,
  isRejected,
  Action,
  isAsyncThunkAction,
  ActionReducerMapBuilder,
} from "@reduxjs/toolkit";

import {
  CreateToastPayload,
  ToastId,
  NotificationsState,
  ToastTimeout,
} from "./types";
import { TxType } from "@namada/shared";
import { TxTypeLabel } from "@namada/types";

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
    action: PayloadAction<{ id: ToastId; txType: TxType }>
  ) {
    state.toasts = {
      ...state.toasts,
      [action.payload.id]: {
        title: `${TxTypeLabel[action.payload.txType]} Tx started`,
        message: "Waiting for transaction confirmation",
        type: "info",
        timeout: ToastTimeout.None(),
      },
    };
  },
  txCompletedToast(
    state: NotificationsState,
    action: PayloadAction<{ id: ToastId; txType: TxType; success: boolean }>
  ) {
    const { id, txType, success } = action.payload;
    state.toasts = {
      ...state.toasts,
      [id]: {
        title: `${TxTypeLabel[txType]} Tx completed`,
        message: `Transaction ${success ? "confirmed" : "rejected"}`,
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
