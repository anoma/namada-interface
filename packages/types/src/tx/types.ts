export type SubmitBondProps = {
  validator: string;
  amount: number;
  source: string;
  txCode: Uint8Array;
  nativeToken: string;
  tx: TxProps;
};

export type SubmitUnbondProps = {
  validator: string;
  amount: number;
  source: string;
  txCode: Uint8Array;
  tx: TxProps;
};

export type TxProps = {
  token: string;
  feeAmount: number;
  gasLimit: number;
  txCode: Uint8Array;
  chainId: string;
};

export type TransferProps = {
  tx: TxProps;
  source: string;
  target: string;
  token: string;
  subPrefix?: string;
  amount: number;
  nativeToken: string;
  txCode: Uint8Array;
};

export type IbcTransferProps = {
  tx: TxProps;
  source: string;
  receiver: string;
  token: string;
  subPrefix?: string;
  amount: number;
  portId: string;
  channelId: string;
  timeoutHeight?: number;
  timeoutSecOffset?: number;
  txCode: Uint8Array;
};

// TODO: This is a placeholder
export type BridgeTransferProps = {
  tx: TxProps;
  source: string;
  target: string;
  token: string;
  amount: number;
  txCode: Uint8Array;
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
