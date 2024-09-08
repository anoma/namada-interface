import { TxProps } from "@namada/types";

export const createNotificationId = (data?: TxProps | TxProps[]): string => {
  if (!data) return Date.now().toString();
  if (Array.isArray(data)) {
    return data.map((tx) => tx.hash).join(";");
  }
  return data.hash;
};
