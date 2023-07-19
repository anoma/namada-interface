import browser from "webextension-polyfill";
import { KVStore } from "@namada/storage";
import { Env, MessageSender } from "router/types";

const ROUTER_ID_KEY = "namadaExtensionRouterId";
const NO_TAB_ID = -2;

export const getNamadaRouterId = async (
  store: KVStore<number>
): Promise<number> => {
  const storedId = await store.get(ROUTER_ID_KEY);
  if (!storedId) {
    const id = Math.floor(Math.random() * 1000000);
    await store.set(ROUTER_ID_KEY, id);

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
