import {
  BatchTxResultMsgValue,
  BondMsgValue,
  EthBridgeTransferMsgValue,
  IbcTransferMsgValue,
  RedelegateMsgValue,
  SignatureMsgValue,
  TransparentTransferDataMsgValue,
  TransparentTransferMsgValue,
  TxResponseMsgValue,
  UnbondMsgValue,
  VoteProposalMsgValue,
  WithdrawMsgValue,
  WrapperTxMsgValue,
} from "./schema";
import { RevealPkMsgValue } from "./schema/revealPk";

export type BatchTxResultProps = BatchTxResultMsgValue;
export type BondProps = BondMsgValue;
export type EthBridgeTransferProps = EthBridgeTransferMsgValue;
export type IbcTransferProps = IbcTransferMsgValue;
export type RedelegateProps = RedelegateMsgValue;
export type SignatureProps = SignatureMsgValue;
export type TransparentTransferProps = TransparentTransferMsgValue;
export type TransparentTransferDataProps = TransparentTransferDataMsgValue;
export type TxResponseProps = TxResponseMsgValue;
export type UnbondProps = UnbondMsgValue;
export type VoteProposalProps = VoteProposalMsgValue;
export type WithdrawProps = WithdrawMsgValue;
export type WrapperTxProps = WrapperTxMsgValue;
export type RevealPkProps = RevealPkMsgValue;

export type SupportedTxProps =
  | BondProps
  | UnbondProps
  | WithdrawProps
  | RedelegateProps
  | EthBridgeTransferProps
  | IbcTransferProps
  | VoteProposalProps
  | TransparentTransferProps
  | RevealPkProps;

export type CommitmentDetailProps = SupportedTxProps & {
  txType: unknown;
  hash: string;
  memo?: string;
};

export type TxDetails = WrapperTxProps & {
  commitments: CommitmentDetailProps[];
};
