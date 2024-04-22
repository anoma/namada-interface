import { SupportedTx } from "@heliax/namada-sdk/web";

export type ApprovedOriginsStore = string[];

export type PendingTx = {
  txMsg: string;
  specificMsg: string;
};

export type TxStore = {
  txType: SupportedTx;
  tx: PendingTx[];
};

// TODO: Add specific types here!
export type PendingTxDetails = Record<string, string>;
