import {
  PayloadAction,
  isPending,
  isFulfilled,
  isRejected,
  Action,
  isAsyncThunkAction,
  ActionReducerMapBuilder,
} from "@reduxjs/toolkit";

import { CreateToastPayload, ToastId, NotificationsState } from "./types";

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
        timeout: data.timeout || DEFAULT_TIMEOUT,
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
};

export const extraReducers = (
  builder: ActionReducerMapBuilder<NotificationsState>
): void => {
  builder.addMatcher(
    isAsyncThunkAction,
    (state: NotificationsState, action: Action) => {
      const [actionType] =
        action.type.match(THUNK_MATCH_REGEXP) || [];
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
