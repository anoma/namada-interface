import {
  createSlice,
  PayloadAction,
  isAsyncThunkAction,
  isPending,
  isFulfilled,
  isRejected,
} from "@reduxjs/toolkit";

export type ToastType = "info" | "warning" | "error" | "success";

export type ToastId = string;

export type Toast = {
  title: string;
  message: string;
  type: ToastType;
  timeout: number;
};

export type NotificationsState = {
  toasts: Record<ToastId, Toast>;
  pendingActions: string[];
};

const initialState: NotificationsState = {
  toasts: {},
  pendingActions: [],
};

const DEFAULT_TIMEOUT = 2000;

const NOTIFICATIONS_ACTIONS_BASE = "notifications";

export type CreateToastPayload = {
  id: ToastId;
  data: Omit<Toast, "timeout"> & Partial<Pick<Toast, "timeout">>;
};

export const NotificationsSlice = createSlice({
  name: NOTIFICATIONS_ACTIONS_BASE,
  initialState,
  reducers: {
    createToast: (state, action: PayloadAction<CreateToastPayload>) => {
      const { id, data } = action.payload;
      state.toasts = {
        ...{
          [id]: {
            title: data.title,
            message: data.message,
            type: data.type,
            timeout: data.timeout || DEFAULT_TIMEOUT,
          },
        },
        ...state.toasts,
      };
    },
    removeToast: (state, action: PayloadAction<{ id: ToastId }>) => {
      const { [action.payload.id]: _, ...newToasts } = state.toasts;
      state.toasts = newToasts;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(isAsyncThunkAction, (state, action) => {
      const [actionType] =
        action.type.match(/^.*(?=\/(pending|fulfilled|rejected)$)/) || [];
      const pendingSet = new Set(state.pendingActions);

      if (actionType) {
        if (isPending(action)) {
          pendingSet.add(actionType);
        } else if (isFulfilled(action) || isRejected(action)) {
          pendingSet.delete(actionType);
        }
        state.pendingActions = Array.from(pendingSet);
      }
    });
  },
});

export const actions = NotificationsSlice.actions;

export default NotificationsSlice.reducer;
