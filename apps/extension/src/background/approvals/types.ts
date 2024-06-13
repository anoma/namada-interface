import { SupportedTx, TxType } from "@heliax/namada-sdk/web";
import { BatchTxData, TxData } from "@namada/types";

export type ApprovedOriginsStore = string[];

export type PendingTx = {
  txType: TxType;
  tx: TxData;
  wrapperTxMsg: Uint8Array;
  signer: string;
};

export type PendingBatchTx = {
  txType: TxType;
  batchTx: BatchTxData;
  wrapperTxMsg: Uint8Array;
  signer: string;
};

export type EncodedTxData = {
  txBytes: string;
  signingDataBytes: string;
};

export type EncodedBatchTxData = {
  txBytes: string;
  signingDataBytes?: string;
};

export type TxStore = {
  txType: SupportedTx;
  tx: PendingTx[];
};
