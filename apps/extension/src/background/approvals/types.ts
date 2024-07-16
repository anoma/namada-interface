import { TxData } from "@namada/types";

export type ApprovedOriginsStore = string[];

export type PendingTx = {
  txs: TxData[];
  signer: string;
  checksums?: Record<string, string>;
};

export type PendingSignArbitrary = string;

// base64 encoded Tx data for use with postMessage
export type EncodedTxData = {
  txBytes: string;
  signingDataBytes: string[];
};
