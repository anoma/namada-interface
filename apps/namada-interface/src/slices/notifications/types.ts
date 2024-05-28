export const enum ToastTimeoutType {
  None,
  Default,
  Ms,
}

interface None {
  kind: ToastTimeoutType.None;
}

interface Default {
  kind: ToastTimeoutType.Default;
  value: number;
}

interface Ms {
  kind: ToastTimeoutType.Ms;
  value: number;
}

type Timeout = None | Default | Ms;

export const ToastTimeout = {
  None(): None {
    return {
      kind: ToastTimeoutType.None,
    };
  },

  Default(): Default {
    return {
      kind: ToastTimeoutType.Default,
      value: 2000,
    };
  },

  Ms(value: number): Ms {
    return {
      kind: ToastTimeoutType.Ms,
      value,
    };
  },
};

export type ToastType =
  | "info"
  | "pending-info"
  | "warning"
  | "error"
  | "success";

export type ToastId = string;

export type Toast = {
  title: string;
  message: string;
  type: ToastType;
  timeout: Timeout;
};

export type NotificationsState = {
  toasts: Record<ToastId, Toast>;
  pendingActions: string[];
};

export type CreateToastPayload = {
  id: ToastId;
  data: Omit<Toast, "timeout"> & Partial<Pick<Toast, "timeout">>;
};
