import browser from "webextension-polyfill";
import { KVStore } from "@anoma/storage";
import { Env, MessageSender } from "router/types";

const ROUTER_ID_KEY = "anomaExtensionRouterId";
const NO_TAB_ID = -2;

export const getAnomaRouterId = async (
  store: KVStore<number>
): Promise<number | undefined> => {
  const storedId = await store.get(ROUTER_ID_KEY);
  if (!storedId) {
    const id = Math.floor(Math.random() * 1000000);
    await store.set(ROUTER_ID_KEY, id);
  }
  return store.get(ROUTER_ID_KEY) as Promise<number | undefined>;
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
