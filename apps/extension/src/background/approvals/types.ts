import { SupportedTx } from "@heliax/namada-sdk/web";
import { BuiltTx } from "@namada/shared";

export type ApprovedOriginsStore = string[];

export type PendingTx = {
  txBytes: Uint8Array;
  chainId: string;
  signer: string;
};

export type TxStore = {
  txType: SupportedTx;
  tx: BuiltTx[];
};

// TODO: Add specific types here!
export type PendingTxDetails = Record<string, string>;
