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
  signInner: boolean;
};

export type SubmitBondProps = {
  validator: string;
  amount: number;
  source: string;
  txCode: Uint8Array;
  nativeToken: string;
  tx: Tx;
};

export type SubmitUnbondProps = {
  validator: string;
  amount: number;
  source: string;
  txCode: Uint8Array;
  tx: Tx;
};

export type Tx = {
  token: string;
  feeAmount: number;
  gasLimit: number;
  txCode: Uint8Array;
};

export type TransferProps = {
  tx: Tx;
  source: string;
  target: string;
  token: string;
  subPrefix?: string;
  amount: number;
  nativeToken: string;
  txCode: Uint8Array;
};

export type IbcTransferProps = {
  sourcePort: string;
  sourceChannel: string;
  token: string;
  sender: string;
  receiver: string;
  amount: number;
};

// TODO: This is a placeholder
export type BridgeTransferProps = {
  source: string;
  target: string;
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
