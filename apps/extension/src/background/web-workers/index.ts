import {
  INIT_MSG,
  Msg,
  SubmitTransferMessageData,
  TRANSFER_FAILED_MSG,
  TRANSFER_SUCCESSFUL_MSG,
} from "./types";

export const init = (
  data: SubmitTransferMessageData,
  transferCompletedHandler: (
    msgId: string,
    success: boolean,
    payload?: string
  ) => Promise<void>
): void => {
  const w = new Worker("submit-transfer-web-worker.namada.js");

  w.onmessage = (e: MessageEvent<Msg>) => {
    const { msgName, payload } = e.data;
    if (msgName === INIT_MSG) {
      w.postMessage(data);
    } else if (msgName === TRANSFER_SUCCESSFUL_MSG) {
      transferCompletedHandler(data.msgId, true, payload).then(() =>
        w.terminate()
      );
    } else if (msgName === TRANSFER_FAILED_MSG) {
      transferCompletedHandler(data.msgId, false, payload).then(() =>
        w.terminate()
      );
    } else {
      console.warn("Not supporeted msg type.");
    }
  };
};
