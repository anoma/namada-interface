export const notificationIdSeparator = ";";
import { TxProps } from "@namada/types";

export const createNotificationId = (
  data?: TxProps["hash"] | TxProps["hash"][]
): string => {
  if (!data) return Date.now().toString();
  if (typeof data === "string") return data;
  if (Array.isArray(data)) return data.join(notificationIdSeparator);
  return data;
};
