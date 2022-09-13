import browser from "webextension-polyfill";
import { Env, MessageSender } from "../router/types";
import { ExtensionKVStore } from "@anoma/storage";

const ROUTER_ID_KEY = "anomaExtensionRouterId";
const store = new ExtensionKVStore("anoma");

export const getAnomaRouterId = async (): Promise<number | undefined> => {
  const storedId = await store.get(ROUTER_ID_KEY);
  if (!storedId) {
    const id = Math.floor(Math.random() * 1000000);
    await store.set(ROUTER_ID_KEY, id);
  }
  return store.get(ROUTER_ID_KEY);
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
