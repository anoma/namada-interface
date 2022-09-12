import browser from "webextension-polyfill";
import { Env, MessageSender } from "../router/types";

declare global {
  var anomaExtensionRouterId: number;
}
// const ROUTER_ID_KEY = "anomaExtensionRouterId";
// export const getAnomaRouterId = async (): Promise<number> => {
//   if (!(await chrome.storage.local.get([ROUTER_ID_KEY]))) {
//     await chrome.storage.local.set({
//       [ROUTER_ID_KEY]: Math.floor(Math.random() * 1000000),
//     });
//   }
//   const record = await chrome.storage.local.get([ROUTER_ID_KEY]);
//   console.log({ record });
//   return record.anomaExtensionRouterId;
// };
// TODO: Utilize the storage API properly as in the above to set a unique ID per instance
// NOTE: This is currently not behaving :(
export const getAnomaRouterId = () => 99999;

// Determine if content-scripts can be executed in this environment
export class ContentScriptEnv {
  static readonly produceEnv = (sender: MessageSender): Env => {
    const isInternalMsg = sender.id === browser.runtime.id;

    return {
      isInternalMsg,
      requestInteraction: () => {
        throw new Error(
          "ContentScriptEnv doesn't support `requestInteraction`"
        );
      },
    };
  };
}
