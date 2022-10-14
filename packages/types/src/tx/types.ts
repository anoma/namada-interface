export type SignedTx = {
  hash: string;
  bytes: string;
};

export type TxProps = {
  token: string;
  epoch: number;
  feeAmount: number;
  gasLimit: number;
  txCode: Uint8Array;
};

export type TransferProps = {
  source: string;
  target: string;
  token: string;
  amount: number;
  key: string | null;
  shielded: Uint8Array | null;
};

export type IbcTransferProps = {
  sourcePort: string;
  sourceChannel: string;
  token: string;
  sender: string;
  receiver: string;
  amount: number;
};

export type InitAccountProps = {
  vpCode: Uint8Array;
};

export type ShieldedDataProps = {
  overwintered: boolean;
  version: string;
  versionGroupId: string;
  vin: Uint8Array;
  vout: Uint8Array;
  lockTime: number;
  expiryHeight: number;
  valueBalance: number;
  shieldedSpends: Uint8Array;
  shieldedConverts: Uint8Array;
  shieldedOutputs: Uint8Array;
  joinSplits: string;
  joinSplitPubKey?: Uint8Array;
  joinSplitSig?: Uint8Array;
  bindingSig?: Uint8Array;
};

export type ShieldedProps = {
  txId: Uint8Array;
  data: Uint8Array; // Encoded ShieldedData
};
