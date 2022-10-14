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

export type CreateToastPayload = {
  id: ToastId;
  data: Omit<Toast, "timeout"> & Partial<Pick<Toast, "timeout">>;
};
