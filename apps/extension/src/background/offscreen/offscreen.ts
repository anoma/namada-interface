import {
  CloseOffscreenDocumentMsg,
  TransferCompletedEvent,
} from "background/keyring";
import { init as initSubmitTransferWebWorker } from "background/web-workers";
import { SubmitTransferMessage } from "background/web-workers/types";
import { ExtensionMessenger, ExtensionRequester } from "extension";
import { Ports } from "router";
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
    routerId,
    target,
  }: SubmitTransferMessage): Promise<boolean> {
    if (target !== OFFSCREEN_TARGET) {
      return false;
    }

    const messenger = new ExtensionMessenger();
    const requester = new ExtensionRequester(messenger, routerId);

    const transferCompletedHandler = async (
      msgId: string,
      success: boolean,
      payload?: string
    ): Promise<void> => {
      // We are sending the message to the background script
      await requester.sendMessage(
        Ports.Background,
        new TransferCompletedEvent(success, msgId, payload)
      );

      // Reducing a number of tracked web workers
      ww_count--;

      // If number of trached web workers is 0, we are
      // closing the offscreen document and stopping the
      // service worker ping.
      if (ww_count === 0) {
        requester.sendMessage<CloseOffscreenDocumentMsg>(
          Ports.Background,
          new CloseOffscreenDocumentMsg()
        );
        clearInterval(pingSw);
      }
    };

    if (type == SUBMIT_TRANSFER_MSG_TYPE) {
      initSubmitTransferWebWorker(data, transferCompletedHandler);
      ww_count++;
    } else {
      console.warn(`Unexpected message type received: '${type}'.`);
      return false;
    }

    return false;
  }
})();
