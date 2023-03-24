// import { ExtensionKVStore } from "@anoma/storage";
// import { ExtensionMessenger, ExtensionRequester } from "extension";
// import { KVPrefix } from "router";
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
  // const store = new ExtensionKVStore(KVPrefix.LocalStorage, {
  //   get: browser.storage.local.get,
  //   set: browser.storage.local.set,
  // });
  // const messenger = new ExtensionMessenger();
  // const _requester = new ExtensionRequester(messenger, store);

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
