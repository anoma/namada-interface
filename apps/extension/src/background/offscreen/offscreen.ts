import {
  SubmitTransferMessage,
  init as initSubmitTransferWebWorker,
} from "background/web-workers";
import { OFFSCREEN_TARGET, SUBMIT_TRANSFER_MSG_TYPE } from "./utils";

(async function init() {
  chrome.runtime.onMessage.addListener(handleMessages);

  async function handleMessages({
    data,
    type,
    target,
  }: SubmitTransferMessage): Promise<boolean> {
    if (target !== OFFSCREEN_TARGET) {
      return false;
    }

    switch (type) {
      case SUBMIT_TRANSFER_MSG_TYPE:
        initSubmitTransferWebWorker(data);
        break;
      default:
        console.warn(`Unexpected message type received: '${type}'.`);
        return false;
    }

    return false;
  }
})();
