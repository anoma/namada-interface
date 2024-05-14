import { SupportedTx } from "@heliax/namada-sdk/web";

export type ApprovedOriginsStore = string[];

export type PendingTx = {
  txBytes: Uint8Array;
  signingDataBytes: Uint8Array;
  signer: string;
};

// TODO: Re-enable TxStore to support multiple Tx
export type TxStore = {
  txType: SupportedTx;
  tx: PendingTx[];
};
