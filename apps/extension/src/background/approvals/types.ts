import { SupportedTx, TxType } from "@heliax/namada-sdk/web";

export type ApprovedOriginsStore = string[];

export type PendingTx = {
  txType: TxType;
  tx: {
    txBytes: Uint8Array;
    signingDataBytes: Uint8Array;
  };
  signer: string;
};

export type PendingBatchTx = {
  txType: TxType;
  batchTx: string;
  txs: {
    txBytes: Uint8Array;
    signingDataBytes: Uint8Array;
  }[];
  signer: string;
};

export type TxStore = {
  txType: SupportedTx;
  tx: PendingTx[];
};
