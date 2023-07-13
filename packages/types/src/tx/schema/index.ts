export * from "./account";
export * from "./ibcTransfer";
export * from "./transfer";
export * from "./bond";
export * from "./signature";
export * from "./revealPK";
export * from "./unbond";
export * from "./withdraw";

import { AccountMsgValue } from "./account";
import { IbcTransferMsgValue } from "./ibcTransfer";
import { TransferMsgValue } from "./transfer";
import { SubmitBondMsgValue } from "./bond";
import { SubmitUnbondMsgValue } from "./unbond";
import { SubmitWithdrawMsgValue } from "./withdraw";
import { SubmitRevealPKMsgValue } from "./revealPK";
import { SignatureMsgValue } from "./signature";

export type Schema =
  | AccountMsgValue
  | IbcTransferMsgValue
  | TransferMsgValue
  | SubmitBondMsgValue
  | SubmitUnbondMsgValue
  | SubmitWithdrawMsgValue
  | SubmitRevealPKMsgValue
  | SignatureMsgValue;
