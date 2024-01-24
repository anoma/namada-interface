import { Message } from "router";

export enum TopLevelRoute {
  Default = "/",

  // Connection approval
  ApproveConnection = "/approve-connection",

  // Transaction approval
  ApproveTx = "/approve-tx",
  ConfirmTx = "/confirm-tx",
  ConfirmLedgerTx = "/confirm-ledger-tx",

  // Signing approval
  ApproveSignature = "/approve-signature",
  ConfirmSignature = "/confirm-signature",
}

export type ApproveMsg = new (
  msgId: string,
  password: string
) => unknown & Message<void>;
