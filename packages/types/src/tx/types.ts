import {
  BatchTxResultMsgValue,
  BondMsgValue,
  CommitmentMsgValue,
  EthBridgeTransferMsgValue,
  IbcTransferMsgValue,
  RedelegateMsgValue,
  SignatureMsgValue,
  TransparentTransferMsgValue,
  TxMsgValue,
  TxResponseMsgValue,
  UnbondMsgValue,
  VoteProposalMsgValue,
  WithdrawMsgValue,
  WrapperTxMsgValue,
} from "./schema";

export type BatchTxResultProps = BatchTxResultMsgValue;
export type BondProps = BondMsgValue;
export type CommitmentProps = CommitmentMsgValue;
export type EthBridgeTransferProps = EthBridgeTransferMsgValue;
export type IbcTransferProps = IbcTransferMsgValue;
export type RedelegateProps = RedelegateMsgValue;
export type SignatureProps = SignatureMsgValue;
export type TransparentTransferProps = TransparentTransferMsgValue;
export type TxProps = TxMsgValue;
export type TxResponseProps = TxResponseMsgValue;
export type UnbondProps = UnbondMsgValue;
export type VoteProposalProps = VoteProposalMsgValue;
export type WithdrawProps = WithdrawMsgValue;
export type WrapperTxProps = WrapperTxMsgValue;
