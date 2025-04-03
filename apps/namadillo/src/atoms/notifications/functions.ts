export const notificationIdSeparator = ";";
import { TxProps } from "@namada/types";

export const createNotificationId = (
  data?: string[] | string | TxProps
): string => {
  if (!data) return Date.now().toString();
  if (typeof data === "string") return data;
  if (Array.isArray(data)) return data.join(notificationIdSeparator);
  return data.hash;
};
