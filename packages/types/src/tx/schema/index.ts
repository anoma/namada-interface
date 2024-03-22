export * from "./bond";
export * from "./ethBridgeTransfer";
export * from "./ibcTransfer";
export * from "./signature";
export * from "./transfer";
export * from "./tx";
export * from "./unbond";
export * from "./utils";
export * from "./voteProposal";
export * from "./withdraw";

import { BondMsgValue } from "./bond";
import { EthBridgeTransferMsgValue } from "./ethBridgeTransfer";
import { IbcTransferMsgValue } from "./ibcTransfer";
import { SignatureMsgValue } from "./signature";
import { TransferMsgValue } from "./transfer";
import { TxMsgValue } from "./tx";
import { UnbondMsgValue } from "./unbond";
import { VoteProposalMsgValue } from "./voteProposal";
import { WithdrawMsgValue } from "./withdraw";

export type Schema =
  | EthBridgeTransferMsgValue
  | IbcTransferMsgValue
  | SignatureMsgValue
  | BondMsgValue
  | UnbondMsgValue
  | VoteProposalMsgValue
  | WithdrawMsgValue
  | TransferMsgValue
  | TxMsgValue;
