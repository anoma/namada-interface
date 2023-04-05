export type SubmitTransferMessage = {
  type: string;
  target: string;
  routerId: number;
  data: SubmitTransferMessageData;
};

export type SubmitTransferMessageData = {
  txMsg: string;
  msgId: string;
  password: string;
};

export const INIT_MSG = "init";
export const TRANSFER_SUCCESSFUL_MSG = "transfer-successful";
export const TRANSFER_FAILED_MSG = "transfer-failed";
export type Msg =
  | typeof INIT_MSG
  | typeof TRANSFER_FAILED_MSG
  | typeof TRANSFER_SUCCESSFUL_MSG;
