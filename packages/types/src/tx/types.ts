import BigNumber from "bignumber.js";

export type SubmitBondProps = {
  validator: string;
  amount: BigNumber;
  source: string;
  nativeToken: string;
  tx: TxProps;
};

export type SubmitUnbondProps = {
  validator: string;
  amount: BigNumber;
  source: string;
  tx: TxProps;
};

export type TxProps = {
  token: string;
  feeAmount: BigNumber;
  gasLimit: BigNumber;
  chainId: string;
  publicKey?: string;
};

export type TransferProps = {
  tx: TxProps;
  source: string;
  target: string;
  token: string;
  subPrefix?: string;
  amount: BigNumber;
  nativeToken: string;
};

export type IbcTransferProps = {
  tx: TxProps;
  source: string;
  receiver: string;
  token: string;
  subPrefix?: string;
  amount: BigNumber;
  portId: string;
  channelId: string;
  timeoutHeight?: number;
  timeoutSecOffset?: number;
};

// TODO: This is a placeholder
export type BridgeTransferProps = {
  tx: TxProps;
  source: string;
  target: string;
  token: string;
  amount: BigNumber;
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
  valueBalance: BigNumber;
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
