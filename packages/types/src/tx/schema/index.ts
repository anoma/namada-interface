export * from "./ethBridgeTransfer";
export * from "./ibcTransfer";
export * from "./transfer";
export * from "./bond";
export * from "./ibcTransfer";
export * from "./signature";
export * from "./transfer";
export * from "./tx";
export * from "./unbond";
export * from "./voteProposal";
export * from "./withdraw";
export * from "./utils";

import { EthBridgeTransferMsgValue } from "./ethBridgeTransfer";
import { IbcTransferMsgValue } from "./ibcTransfer";
import { SignatureMsgValue } from "./signature";
import { SubmitBondMsgValue } from "./bond";
import { SubmitUnbondMsgValue } from "./unbond";
import { SubmitVoteProposalMsgValue } from "./voteProposal";
import { SubmitWithdrawMsgValue } from "./withdraw";
import { TransferMsgValue } from "./transfer";
import { TxMsgValue } from "./tx";

export type Schema =
  | EthBridgeTransferMsgValue
  | IbcTransferMsgValue
  | SignatureMsgValue
  | SubmitBondMsgValue
  | SubmitUnbondMsgValue
  | SubmitVoteProposalMsgValue
  | SubmitWithdrawMsgValue
  | TransferMsgValue
  | TxMsgValue;
