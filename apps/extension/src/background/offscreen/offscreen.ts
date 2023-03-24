import { init as initSubmitTransferWebWorker } from "background/web-workers";
import {
  Msg,
  SubmitTransferMessage,
  TRANSFER_FAILED_MSG,
  TRANSFER_SUCCESSFUL_MSG,
} from "background/web-workers/types";
import { OFFSCREEN_TARGET, SUBMIT_TRANSFER_MSG_TYPE } from "./utils";

const SW_TTL = 20000;

(async function init() {
  let ww_count = 0;
  chrome.runtime.onMessage.addListener(handleMessages);

  const pingSw = setInterval(() => {
    chrome.runtime.sendMessage({ keepAlive: true });
  }, SW_TTL);

  async function handleMessages({
    data,
    type,
    target,
  }: SubmitTransferMessage): Promise<boolean> {
    if (target !== OFFSCREEN_TARGET) {
      return false;
    }

    const onmessage = (e: MessageEvent<Msg>): void => {
      if ([TRANSFER_SUCCESSFUL_MSG, TRANSFER_FAILED_MSG].includes(e.data)) {
        ww_count--;
      }

      if (ww_count === 0) {
        clearInterval(pingSw);
      }
    };

    if (type == SUBMIT_TRANSFER_MSG_TYPE) {
      initSubmitTransferWebWorker(data, onmessage);
      ww_count++;
    } else {
      console.warn(`Unexpected message type received: '${type}'.`);
      return false;
    }

    return false;
  }
})();
