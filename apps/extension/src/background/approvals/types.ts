import { SigningDataProps, TxProps } from "@namada/types";

export type ApprovedOriginsStore = string[];

export type PendingTx = {
  txs: TxProps[];
  signer: string;
  checksums?: Record<string, string>;
};

export type PendingSignArbitrary = string;

// base64 encoded Uint8Arrays for use with postMessage
export type EncodedSigningData = Pick<
  SigningDataProps,
  "publicKeys" | "threshold" | "feePayer" | "owner"
> & {
  accountPublicKeysMap?: string;
  shieldedHash?: string;
  masp?: string;
};

export type EncodedTxData = Pick<TxProps, "args" | "hash"> & {
  bytes: string;
  signingData: EncodedSigningData[];
};
