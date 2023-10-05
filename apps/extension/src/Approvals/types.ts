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

export type ApproveMsg = new (msgId: string, password: string) => unknown &
  Message<void>;
