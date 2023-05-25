import { TransferCompletedEvent as BackgroundTransferCompletedEvent } from "background/keyring";
// import { TransferCompletedEvent as ContentTransferCompletedEvent } from "content/events";
import { ExtensionMessenger, ExtensionRequester } from "extension";
import { Ports } from "router";
import {
  INIT_MSG,
  Msg,
  SubmitTransferMessageData,
  TRANSFER_FAILED_MSG,
  TRANSFER_SUCCESSFUL_MSG,
} from "./types";

const sendTransferCompletedEvent = (
  requester: ExtensionRequester,
  { success, msgId }: { success: boolean; msgId: string }
): Promise<void> => {
  const { TARGET } = process.env;
  if (TARGET === "chrome") {
    return requester.sendMessage(
      Ports.Background,
      new BackgroundTransferCompletedEvent(success, msgId)
    );
  } else if (TARGET === "firefox") {
    //TODO:
    // return requester.sendMessageToTab(
    //   senderTabId,
    //   Ports.WebBrowser,
    //   new ContentTransferCompletedEvent(success, msgId)
    // );

    return Promise.resolve();
  } else {
    throw Error("Unsupported target.");
  }
};

export const init = (
  data: SubmitTransferMessageData,
  routerId: number,
  onMessage?: (e: MessageEvent<Msg>) => void
): void => {
  const w = new Worker("submit-transfer-web-worker.anoma.js");
  const messenger = new ExtensionMessenger();
  const requester = new ExtensionRequester(messenger, routerId);

  w.onmessage = (e: MessageEvent<Msg>) => {
    onMessage && onMessage(e);

    if (e.data === INIT_MSG) {
      w.postMessage(data);
    } else if (e.data === TRANSFER_SUCCESSFUL_MSG) {
      //TODO: Figure out if we do not need to pass msgId from the WebWorker
      sendTransferCompletedEvent(requester, {
        success: true,
        msgId: data.msgId,
      }).then(() => w.terminate());
    } else if (e.data === TRANSFER_FAILED_MSG) {
      sendTransferCompletedEvent(requester, {
        success: false,
        msgId: data.msgId,
      }).then(() => w.terminate());
    } else {
      console.warn("Not supporeted msg type.");
    }
  };
};
