import {
  BatchTxResultMsgValue,
  BondMsgValue,
  ClaimRewardsMsgValue,
  EthBridgeTransferMsgValue,
  IbcTransferMsgValue,
  MaspTxIn,
  MaspTxOut,
  RedelegateMsgValue,
  ShieldedTransferDataMsgValue,
  ShieldedTransferMsgValue,
  ShieldingTransferDataMsgValue,
  ShieldingTransferMsgValue,
  SignatureMsgValue,
  SigningDataMsgValue,
  TransferDetailsMsgValue,
  TransferMsgValue,
  TransparentTransferDataMsgValue,
  TransparentTransferMsgValue,
  TxMsgValue,
  TxResponseMsgValue,
  UnbondMsgValue,
  UnshieldingTransferDataMsgValue,
  UnshieldingTransferMsgValue,
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
export type ShieldedTransferProps = ShieldedTransferMsgValue;
export type ShieldedTransferDataProps = ShieldedTransferDataMsgValue;
export type ShieldingTransferProps = ShieldingTransferMsgValue;
export type ShieldingTransferDataProps = ShieldingTransferDataMsgValue;
export type UnshieldingTransferDataProps = UnshieldingTransferDataMsgValue;
export type UnshieldingTransferProps = UnshieldingTransferMsgValue;
export type TransferProps = TransferMsgValue;
export type MaspTxInProps = MaspTxIn;
export type MaspTxOutProps = MaspTxOut;
export type TransferDetailsProps = TransferDetailsMsgValue;
export type TransparentTransferProps = TransparentTransferMsgValue;
export type TransparentTransferDataProps = TransparentTransferDataMsgValue;
export type TxProps = TxMsgValue;
export type TxResponseProps = TxResponseMsgValue;
export type SigningDataProps = SigningDataMsgValue;
export type UnbondProps = UnbondMsgValue;
export type VoteProposalProps = VoteProposalMsgValue;
export type ClaimRewardsProps = ClaimRewardsMsgValue;
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
  | ClaimRewardsProps
  | TransferProps
  | TransferDetailsProps
  | RevealPkProps;

export type CommitmentDetailProps = SupportedTxProps & {
  txType: unknown;
  hash: string;
  memo?: string;
  maspTxIn?: MaspTxIn[];
  maspTxOut?: MaspTxOut[];
};

export type TxDetails = WrapperTxProps & {
  commitments: CommitmentDetailProps[];
  // We override wrapperFeePayer to be a string because it should always be defined at this point
  wrapperFeePayer: string;
};
