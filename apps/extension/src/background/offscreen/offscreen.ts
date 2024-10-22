import {
  CloseOffscreenDocumentMsg,
  GenerateProofCompletedEvent,
} from "background/keyring";
import { init as initGenerateProofWorker } from "background/web-workers";
import { GenerateProofMessage } from "background/web-workers/types";
import { ExtensionMessenger, ExtensionRequester } from "extension";
import { Ports } from "router";
import { GENERATE_PROOF_MSG_TYPE, OFFSCREEN_TARGET } from "./utils";

const SW_TTL = 20000;

void (async function init() {
  let ww_count = 0;
  chrome.runtime.onMessage.addListener(handleMessages);

  const pingSw = setInterval(() => {
    // We do not have to "await" as this is fire and forget
    void chrome.runtime.sendMessage({ keepAlive: true });
  }, SW_TTL);

  // Return value of true indicates response will be asynchronously
  // sent using sendResponse; false otherwise.
  function handleMessages(
    generateProofMessage: GenerateProofMessage,
    _sender: unknown,
    sendResponse: (response?: unknown) => void
  ): boolean {
    const { data, type, routerId, target } = generateProofMessage;

    if (target !== OFFSCREEN_TARGET) {
      return false;
    }

    const messenger = new ExtensionMessenger();
    const requester = new ExtensionRequester(messenger, routerId);

    const generateProofCompletedHandler = async (
      msgId: string,
      success: boolean,
      payload?: string
    ): Promise<void> => {
      // We are sending the message to the background script
      await requester.sendMessage(
        Ports.Background,
        new GenerateProofCompletedEvent(success, msgId, payload)
      );

      // Reducing a number of tracked web workers
      ww_count--;

      // If number of trached web workers is 0, we are
      // closing the offscreen document and stopping the
      // service worker ping.
      if (ww_count === 0) {
        // We do not have to wait for the response
        void requester.sendMessage<CloseOffscreenDocumentMsg>(
          Ports.Background,
          new CloseOffscreenDocumentMsg()
        );
        clearInterval(pingSw);
        // send blank response since returning true requires we send a response
        sendResponse();
      }
    };

    if (type == GENERATE_PROOF_MSG_TYPE) {
      initGenerateProofWorker(
        data,
        generateProofCompletedHandler,
        sendResponse
      );
      ww_count++;
    } else {
      console.warn(`Unexpected message type received: '${type}'.`);
      return false;
    }

    return true;
  }
})();
