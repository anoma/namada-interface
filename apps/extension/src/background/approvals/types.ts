import { SupportedTx } from "@heliax/namada-sdk/web";

export type ApprovedOriginsStore = string[];

export type TxStore = {
  txType: SupportedTx;
  txMsg: string;
  specificMsg: string;
};

// TODO: Add specific types here!
export type PendingTxDetails = Record<string, string>;
