import { SupportedTx } from "@heliax/namada-sdk/web";

export type ApprovedOriginsStore = string[];

export type PendingTx = {
  tx: {
    txBytes: Uint8Array;
    signingDataBytes: Uint8Array;
  }[];
  signer: string;
};

export type TxStore = {
  txType: SupportedTx;
  tx: PendingTx[];
};
