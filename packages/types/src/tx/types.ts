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
