import { TxData } from "@namada/types";

export type ApprovedOriginsStore = string[];

export type PendingTx = {
  tx: TxData;
  signer: string;
  checksums?: Record<string, string>;
  // Optional tx bytes array
  txs?: Uint8Array[];
};

export type PendingSignArbitrary = string;

// base64 encoded Tx data for use with postMessage
export type EncodedTxData = {
  // encoded batch Tx
  txBytes: string;
  signingDataBytes: string[];
  // optional encoded tx bytes array
  txs?: string[];
};
