export * from "./account";
export * from "./ibcTransfer";
export * from "./transfer";
export * from "./bond";
export * from "./signature";
export * from "./unbond";
export * from "./withdraw";

import { AccountMsgValue } from "./account";
import { IbcTransferMsgValue } from "./ibcTransfer";
import { TransferMsgValue } from "./transfer";
import { SubmitBondMsgValue } from "./bond";
import { SubmitUnbondMsgValue } from "./unbond";
import { SubmitWithdrawMsgValue } from "./withdraw";
import { SignatureMsgValue } from "./signature";
import { TxMsgValue } from "./tx";

export type Schema =
  | AccountMsgValue
  | IbcTransferMsgValue
  | TransferMsgValue
  | SubmitBondMsgValue
  | SubmitUnbondMsgValue
  | SubmitWithdrawMsgValue
  | SignatureMsgValue
  | TxMsgValue;
