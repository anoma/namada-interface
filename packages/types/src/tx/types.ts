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

export type SubmitWithdrawProps = {
  validator: string;
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

export type RevealPKProps = {
  publicKey: string;
  tx: TxProps;
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
  timeoutHeight?: bigint;
  timeoutSecOffset?: bigint;
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

export type SignatureProps = {
  salt: Uint8Array;
  indicies: Uint8Array;
  pubkey: Uint8Array;
  signature: Uint8Array;
};
