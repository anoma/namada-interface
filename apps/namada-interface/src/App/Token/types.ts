import { Account, TokenInfo, TokenType } from "@namada/types";
import BigNumber from "bignumber.js";

export enum TransferType {
  IBC = "IBC",
  Shielded = "Shielded",
  Transparent = "Transparent",
}

export type IBCTransferAttributes = {
  sourceChannel: string;
  sourcePort: string;
  destinationChannel: string;
  destinationPort: string;
  timeoutHeight: number;
  timeoutTimestamp: number;
  chainId: string;
};

export type TransferTransaction = {
  chainId: string;
  source: string;
  target: string;
  type: TransferType;
  amount: number;
  height: number;
  tokenType: TokenType;
  gas: number;
  appliedHash: string;
  memo?: string;
  timestamp: number;
  ibcTransfer?: IBCTransferAttributes;
};

type TxArgs = {
  chainId: string;
  account: Account;
  token: TokenType;
  target: string;
  amount: BigNumber;
  memo?: string;
  feeAmount?: BigNumber;
  gasLimit?: BigNumber;
  disposableSigningKey?: boolean;
  nativeToken: string;
};

export type TxTransferArgs = TxArgs & {
  faucet?: string;
};

export type TxIbcTransferArgs = Omit<TxArgs, "token"> & {
  chainId: string;
  channelId: string;
  portId: string;
  token: TokenInfo;
};
