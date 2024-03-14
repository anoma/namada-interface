export type ToastNotification = {
  id: string;
  type: "pending" | "success" | "error";
  title: React.ReactNode;
  description: React.ReactNode;
};
