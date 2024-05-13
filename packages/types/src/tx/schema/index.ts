export * from "./bond";
export * from "./ethBridgeTransfer";
export * from "./ibcTransfer";
export * from "./redelegate";
export * from "./signature";
export * from "./transfer";
export * from "./unbond";
export * from "./utils";
export * from "./voteProposal";
export * from "./withdraw";
export * from "./wrapperTx";

import { BondMsgValue } from "./bond";
import { EthBridgeTransferMsgValue } from "./ethBridgeTransfer";
import { IbcTransferMsgValue } from "./ibcTransfer";
import { RedelegateMsgValue } from "./redelegate";
import { SignatureMsgValue } from "./signature";
import { TransferMsgValue } from "./transfer";
import { UnbondMsgValue } from "./unbond";
import { VoteProposalMsgValue } from "./voteProposal";
import { WithdrawMsgValue } from "./withdraw";
import { WrapperTxMsgValue } from "./wrapperTx";

export type Schema =
  | EthBridgeTransferMsgValue
  | IbcTransferMsgValue
  | SignatureMsgValue
  | BondMsgValue
  | UnbondMsgValue
  | VoteProposalMsgValue
  | WithdrawMsgValue
  | TransferMsgValue
  | WrapperTxMsgValue
  | RedelegateMsgValue;
