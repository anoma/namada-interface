export type ToastNotification = {
  id: string;
  type: "pending" | "success" | "error";
  title: React.ReactNode;
  description: React.ReactNode;
  timeout?: number;
};

export type ToastNotificationEntryFilter = (
  notification: ToastNotificationEntry
) => boolean;
