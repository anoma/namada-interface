import { TxProps } from "@namada/types";

export const notificationIdSeparator = ";";

export const createNotificationId = (
  data?: TxProps | TxProps[] | string
): string => {
  if (!data) return Date.now().toString();
  if (typeof data === "string") return data;

  if (Array.isArray(data)) {
    return data
      .map((tx) => {
        if (tx.hash) return tx.hash;
        else if ("innerTxHashes" in tx && Array.isArray(tx.innerTxHashes))
          return tx.innerTxHashes.join(notificationIdSeparator);
      })
      .join(notificationIdSeparator);
  }
  return data.hash;
};
