import { TxData } from "@namada/types";

export type ApprovedOriginsStore = string[];

export type PendingTx = {
  tx: TxData;
  signer: string;
  checksums?: Record<string, string>;
  // Optional tx bytes array
  txs?: TxData[];
};

export type PendingSignArbitrary = string;

export type EncodedTxData = {
  txBytes: string;
  signingDataBytes: string[];
};

// base64 encoded Tx data for use with postMessage
export type EncodedPendingTxData = EncodedTxData & {
  // optional encoded tx bytes array
  txs?: EncodedTxData[];
};
