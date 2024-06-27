export * from "./batchTxResult";
export * from "./bond";
export * from "./ethBridgeTransfer";
export * from "./ibcTransfer";
export * from "./redelegate";
export * from "./signature";
export * from "./transparentTransfer";
export * from "./txDetails";
export * from "./txResponse";
export * from "./unbond";
export * from "./utils";
export * from "./voteProposal";
export * from "./withdraw";
export * from "./wrapperTx";

import { BatchTxResultMsgValue } from "./batchTxResult";
import { BondMsgValue } from "./bond";
import { EthBridgeTransferMsgValue } from "./ethBridgeTransfer";
import { IbcTransferMsgValue } from "./ibcTransfer";
import { RedelegateMsgValue } from "./redelegate";
import { SignatureMsgValue } from "./signature";
import { TransparentTransferMsgValue } from "./transparentTransfer";
import { CommitmentMsgValue, TxDetailsMsgValue } from "./txDetails";
import { TxResponseMsgValue } from "./txResponse";
import { UnbondMsgValue } from "./unbond";
import { VoteProposalMsgValue } from "./voteProposal";
import { WithdrawMsgValue } from "./withdraw";
import { WrapperTxMsgValue } from "./wrapperTx";

export type Schema =
  | BatchTxResultMsgValue
  | EthBridgeTransferMsgValue
  | IbcTransferMsgValue
  | SignatureMsgValue
  | BondMsgValue
  | UnbondMsgValue
  | VoteProposalMsgValue
  | WithdrawMsgValue
  | TransparentTransferMsgValue
  | TxResponseMsgValue
  | WrapperTxMsgValue
  | RedelegateMsgValue
  | CommitmentMsgValue
  | TxDetailsMsgValue;
