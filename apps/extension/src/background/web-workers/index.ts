import { TransferCompletedMsg as BackgroundTransferCompletedMsg } from "background/content";
import { TransferCompletedMsg as ContentTransferCompletedMsg } from "content/events";
import { ExtensionMessenger, ExtensionRequester } from "extension";
import { Ports } from "router";
import {
  INIT_MSG,
  Msg,
  SubmitTransferMessageData,
  TRANSFER_FAILED_MSG,
  TRANSFER_SUCCESSFUL_MSG,
} from "./types";

const sendTransferCompletedMsg = (
  requester: ExtensionRequester,
  success: boolean
): Promise<void> => {
  const { TARGET } = process.env;
  if (TARGET === "chrome") {
    return requester.sendMessage(
      Ports.Background,
      new BackgroundTransferCompletedMsg(success)
    );
  } else if (TARGET === "firefox") {
    return requester.sendMessageToCurrentTab(
      Ports.WebBrowser,
      new ContentTransferCompletedMsg(success)
    );
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
      sendTransferCompletedMsg(requester, true).then(() => w.terminate());
    } else if (e.data === TRANSFER_FAILED_MSG) {
      sendTransferCompletedMsg(requester, false).then(() => w.terminate());
    } else {
      console.warn("Not supporeted msg type.");
    }
  };
};
