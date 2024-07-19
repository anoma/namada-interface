import { TxType } from "@heliax/namada-sdk/web";
import { TxData } from "@namada/types";

export type ApprovedOriginsStore = string[];

export type PendingTx = {
  txType: TxType;
  tx: TxData;
  wrapperTxMsg: Uint8Array;
  signer: string;
  checksums?: Record<string, string>;
};

export type PendingSignArbitrary = string;

export type EncodedTxData = {
  txBytes: string;
  signingDataBytes: string[];
};
