import { TxType } from "@namada/shared";

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
