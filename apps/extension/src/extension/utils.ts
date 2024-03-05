import { Env, MessageSender } from "router/types";
import { LocalStorage } from "storage";
import browser from "webextension-polyfill";

const NO_TAB_ID = -2;

export const getNamadaRouterId = async (
  store: LocalStorage
): Promise<number> => {
  const storedId = await store.getRouterId();
  if (!storedId) {
    const id = Math.floor(Math.random() * 1000000);
    await store.setRouterId(id);

    return id;
  }
  return storedId;
};

// Determine if content-scripts can be executed in this environment
export class ContentScriptEnv {
  static readonly produceEnv = (sender: MessageSender): Env => {
    const isInternalMsg = sender.id === browser.runtime.id;
    const senderTabId = sender.tab?.id || NO_TAB_ID;

    return {
      isInternalMsg,
      senderTabId,
      requestInteraction: () => {
        throw new Error(
          "ContentScriptEnv doesn't support `requestInteraction`"
        );
      },
    };
  };
}
