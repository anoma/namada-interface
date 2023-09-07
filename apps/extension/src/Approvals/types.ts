import { TxType } from "@namada/shared";
import {
  SubmitApprovedBondMsg,
  SubmitApprovedTransferMsg,
  SubmitApprovedIbcTransferMsg,
  SubmitApprovedUnbondMsg,
  SubmitApprovedWithdrawMsg,
  SubmitApprovedEthBridgeTransferMsg,
} from "background/approvals";
import { Message } from "router";

export enum TopLevelRoute {
  Default = "/",

  // Connection approval
  ApproveConnection = "/approve-connection",

  // Transaction approval
  ApproveTx = "/approve-tx",
  ConfirmTx = "/confirm-tx",
  ConfirmLedgerTx = "/confirm-ledger-tx",
}

export type SupportedTx = Extract<
  TxType,
  | TxType.Bond
  | TxType.Unbond
  | TxType.Transfer
  | TxType.IBCTransfer
  | TxType.EthBridgeTransfer
  | TxType.Withdraw
>;

export type ApproveMsg = new (msgId: string, password: string) => unknown &
  Message<void>;

export const txMap: Map<SupportedTx, ApproveMsg> = new Map([
  [TxType.Bond, SubmitApprovedBondMsg],
  [TxType.Unbond, SubmitApprovedUnbondMsg],
  [TxType.Transfer, SubmitApprovedTransferMsg],
  [TxType.IBCTransfer, SubmitApprovedIbcTransferMsg],
  [TxType.EthBridgeTransfer, SubmitApprovedEthBridgeTransferMsg],
  [TxType.Withdraw, SubmitApprovedWithdrawMsg],
]);
