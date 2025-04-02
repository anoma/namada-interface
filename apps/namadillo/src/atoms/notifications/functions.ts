import { TxProps } from "@namada/types";
import { EncodedTxData } from "lib/query";

export const notificationIdSeparator = ";";

export const createNotificationId = (
  data?: TxProps | TxProps[] | string | EncodedTxData<TxProps>
): string => {
  if (!data) return Date.now().toString();
  if (typeof data === "string") return data;
  if (
    (data as EncodedTxData<TxProps>).type &&
    (data as EncodedTxData<TxProps>).type === "buildIbcTransfer"
  ) {
    return (data as EncodedTxData<TxProps>).txs[0].innerTxHashes.join(
      notificationIdSeparator
    );
  }
  if (Array.isArray(data)) {
    return data
      .map((tx) => {
        if (tx.hash) return tx.hash;
        else if ("innerTxHashes" in tx && Array.isArray(tx.innerTxHashes))
          return tx.innerTxHashes.join(notificationIdSeparator);
      })
      .join(notificationIdSeparator);
  }
  return (data as TxProps).hash;
};
