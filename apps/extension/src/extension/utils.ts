// import browser from "webextension-polyfill";
import { Env, MessageSender } from "../router/types";

declare global {
  var anomaExtensionRouterId: number;
}

export const getAnomaRouterId = (): number => {
  if (!window.anomaExtensionRouterId) {
    window.anomaExtensionRouterId = Math.floor(Math.random() * 1000000);
  }
  return window.anomaExtensionRouterId;
};

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
