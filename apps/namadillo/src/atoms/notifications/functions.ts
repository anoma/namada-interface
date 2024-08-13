import { BuiltTx } from "@heliax/namada-sdk/web";

export const createNotificationId = (data?: BuiltTx | BuiltTx[]): string => {
  if (!data) return Date.now().toString();
  if (Array.isArray(data)) {
    return data.map((tx) => tx.tx_hash()).join(";");
  }
  return data.tx_hash();
};
