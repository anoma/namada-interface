export * from "./account";
export * from "./ibcTransfer";
export * from "./transfer";
export * from "./bond";
export * from "./revealPK";
export * from "./unbond";

import { AccountMsgValue } from "./account";
import { IbcTransferMsgValue } from "./ibcTransfer";
import { TransferMsgValue } from "./transfer";
import { SubmitBondMsgValue } from "./bond";
import { SubmitUnbondMsgValue } from "./unbond";
import { SubmitRevealPKMsgValue } from "./revealPK";

export type Schema =
  | AccountMsgValue
  | IbcTransferMsgValue
  | TransferMsgValue
  | SubmitBondMsgValue
  | SubmitUnbondMsgValue
  | SubmitRevealPKMsgValue;
