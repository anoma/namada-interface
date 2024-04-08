import { TransferMsgValue, TxMsgValue } from "@namada/types";
import { SigningKey } from "background/keyring";

export type SubmitTransferMessage = {
  type: string;
  target: string;
  routerId: number;
  data: SubmitTransferMessageData;
};

export type SubmitTransferMessageData = {
  transferMsg: TransferMsgValue;
  txMsg: TxMsgValue;
  msgId: string;
  signingKey: SigningKey;
  rpc: string;
  nativeToken: string;
};

export const INIT_MSG = "init";
export const TRANSFER_SUCCESSFUL_MSG = "transfer-successful";
export const TRANSFER_FAILED_MSG = "transfer-failed";
export const WEB_WORKER_ERROR_MSG = "web-worker-error";
export type MsgName =
  | typeof INIT_MSG
  | typeof TRANSFER_FAILED_MSG
  | typeof TRANSFER_SUCCESSFUL_MSG
  | typeof WEB_WORKER_ERROR_MSG;

export type Msg = { msgName: MsgName; payload?: string };
