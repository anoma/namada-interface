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

// TODO: These could probably be removed altogether, but maybe they're useful to
// distinguish between values created as plain object literals and values
// created using a class constructor.
export type TxProps = TxMsgValue;
export type BondProps = BondMsgValue;
export type UnbondProps = UnbondMsgValue;
export type WithdrawProps = WithdrawMsgValue;
export type TransferProps = TransferMsgValue;
export type EthBridgeTransferProps = EthBridgeTransferMsgValue;
export type SignatureProps = SignatureMsgValue;
export type VoteProposalProps = VoteProposalMsgValue;
export type IbcTransferProps = IbcTransferMsgValue;
