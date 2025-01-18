import { TxProps } from "@namada/types";

export const createNotificationId = (
  data?: TxProps | TxProps[] | string
): string => {
  if (!data) return Date.now().toString();
  if (typeof data === "string") return data;
  if (Array.isArray(data)) {
    return data.map((tx) => tx.hash).join(";");
  }
  return data.hash;
};

