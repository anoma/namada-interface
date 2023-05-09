import { KVStore } from "@anoma/storage";

import { TabStore } from "./types";
import { ExtensionRequester } from "extension";

export const syncTabs = async (
  connectedTabStore: KVStore<TabStore[]>,
  requester: ExtensionRequester,
  chainId: string
): Promise<TabStore[]> => {
  const tabs = await requester.queryBrowserTabIds();
  const storedTabs = await connectedTabStore.get(chainId);
  const currentTabs: TabStore[] = [];

  if (storedTabs?.length === 0) {
    return [];
  }

  storedTabs?.forEach((tab: TabStore) => {
    if (tabs.indexOf(tab.tabId) > -1) {
      currentTabs.push(tab);
    }
  });
  await connectedTabStore.set(chainId, currentTabs);
  return currentTabs;
};
