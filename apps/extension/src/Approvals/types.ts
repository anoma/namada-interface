import { Message } from "router";

export enum TopLevelRoute {
  Default = "/",

  // Connection approval
  ApproveConnection = "/approve-connection",

  // Sign Tx approval
  ApproveSignTx = "/approve-sign-tx",
  ConfirmSignTx = "/confirm-sign-tx",
  ConfirmLedgerTx = "/confirm-ledger-tx",

  // Sign arbitrary approval
  ApproveSignArbitrary = "/approve-sign-arbitrary",
  ConfirmSignArbitrary = "/confirm-sign-arbitrary",
}

export type ApproveMsg = new (
  msgId: string,
  password: string
) => unknown & Message<void>;
