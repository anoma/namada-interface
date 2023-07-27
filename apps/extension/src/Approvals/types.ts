import { TxType } from "@namada/shared";
import {
  SubmitApprovedBondMsg,
  SubmitApprovedTransferMsg,
  SubmitApprovedUnbondMsg,
  SubmitApprovedWithdrawMsg,
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

export const TxTypeLabel: Record<TxType, string> = {
  [TxType.Bond]: "bond",
  [TxType.Unbond]: "unbond",
  [TxType.Transfer]: "transfer",
  [TxType.Withdraw]: "withdraw",
  [TxType.RevealPK]: "reveal-pk",
};

export type SupportedTx = Extract<
  TxType,
  TxType.Bond | TxType.Unbond | TxType.Transfer | TxType.Withdraw
>;

export type ApproveMsg = new (msgId: string, password: string) => unknown &
  Message<void>;

export const txMap: Map<SupportedTx, ApproveMsg> = new Map([
  [TxType.Bond, SubmitApprovedBondMsg],
  [TxType.Unbond, SubmitApprovedUnbondMsg],
  [TxType.Transfer, SubmitApprovedTransferMsg],
  [TxType.Withdraw, SubmitApprovedWithdrawMsg],
]);
