import BigNumber from "bignumber.js";
import { TokenInfo } from "./tokens";

import {
  BondMsgValue,
  EthBridgeTransferMsgValue,
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
export type BridgeTransferProps = EthBridgeTransferMsgValue;
export type SignatureProps = SignatureMsgValue;
export type VoteProposalProps = VoteProposalMsgValue;

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
