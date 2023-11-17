import BigNumber from "bignumber.js";
import { TokenInfo } from "./tokens";

import {
  TxMsgValue,
  SubmitBondMsgValue,
  SubmitUnbondMsgValue,
  SubmitWithdrawMsgValue,
  TransferMsgValue,
  EthBridgeTransferMsgValue,
  SignatureMsgValue,
  SubmitVoteProposalMsgValue,
} from "./schema";

// TODO: These could probably be removed altogether, but maybe they're useful to
// distinguish between values created as plain object literals and values
// created using a class constructor.
export type TxProps = TxMsgValue;
export type SubmitBondProps = SubmitBondMsgValue;
export type SubmitUnbondProps = SubmitUnbondMsgValue;
export type SubmitWithdrawProps = SubmitWithdrawMsgValue;
export type TransferProps = TransferMsgValue;
export type BridgeTransferProps = EthBridgeTransferMsgValue;
export type SignatureProps = SignatureMsgValue;
export type SubmitVoteProposalProps = SubmitVoteProposalMsgValue;

export type IbcTransferProps = {
  source: string;
  receiver: string;
  token: TokenInfo;
  amount: BigNumber;
  portId: string;
  channelId: string;
  timeoutHeight?: bigint;
  timeoutSecOffset?: bigint;
};
