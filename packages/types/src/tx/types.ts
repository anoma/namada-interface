import {
  BondMsgValue,
  EthBridgeTransferMsgValue,
  IbcTransferMsgValue,
  SignatureMsgValue,
  TransferMsgValue,
  TxMsgValue,
  UnbondMsgValue,
  VoteProposalMsgValue,
  WithdrawMsgValue,
} from "./schema";

export type TxProps = TxMsgValue;
export type BondProps = BondMsgValue;
export type UnbondProps = UnbondMsgValue;
export type WithdrawProps = WithdrawMsgValue;
export type TransferProps = TransferMsgValue;
export type EthBridgeTransferProps = EthBridgeTransferMsgValue;
export type SignatureProps = SignatureMsgValue;
export type VoteProposalProps = VoteProposalMsgValue;
export type IbcTransferProps = IbcTransferMsgValue;
