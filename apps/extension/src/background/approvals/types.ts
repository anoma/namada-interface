import { TxData } from "@namada/types";

export type ApprovedOriginsStore = string[];

export type PendingTx = {
  txs: TxData[];
  signer: string;
  checksums?: Record<string, string>;
};

export type PendingSignArbitrary = string;

export type EncodedTxData = {
  txBytes: string;
  signingDataBytes: string[];
};
