import {
  INIT_MSG,
  Msg,
  SubmitTransferMessageData,
  TRANSFER_FAILED_MSG,
  TRANSFER_SUCCESSFUL_MSG,
} from "./types";

export const init = (
  data: SubmitTransferMessageData,
  onMessage?: (e: MessageEvent<Msg>) => void
): void => {
  const w = new Worker("submit-transfer-web-worker.anoma.js");

  w.onmessage = (e: MessageEvent<Msg>) => {
    onMessage && onMessage(e);

    if (e.data === INIT_MSG) {
      w.postMessage(data);
    } else if (e.data === TRANSFER_SUCCESSFUL_MSG) {
      // TODO: notify extension
      w.terminate();
    } else if (e.data === TRANSFER_FAILED_MSG) {
      // TODO: notify extension
      w.terminate();
    } else {
      console.warn("Not supporeted msg type.");
    }
  };
};
