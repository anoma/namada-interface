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

export const ApprovalErrors = {
  AccountNotFound: (address: string) => `Could not find account for ${address}`,
  KeychainLocked: () => "Keychain is locked!",
  PendingSigningDataNotFound: (msgId: string) =>
    `Pending signing data not found for ${msgId}!`,
  PendingSignArbitaryDataNotFound: (msgId: string) =>
    `Pending sign arbitrary data not found for ${msgId}!`,
  TransactionDataNotFound: (msgId: string) =>
    `Transaction data not found for ${msgId}`,
  InvalidLedgerSignature: (msgId: string) =>
    `Did not receive correct signatures for tx ${msgId}`,
};
