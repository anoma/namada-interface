import { KVStore } from "@namada/storage";

import { TabStore } from "./types";
import { ExtensionRequester } from "extension";

const TAB_STORE_PREFIX = "tabs";

/**
 * Utility to sync tabs in storage with currently available tabs in browser
 *
 * @param {TabStore[]} connectedTabsStore
 * @param {ExtensionRequester} requester
 *
 * @return Promise<TabStore[]>
 */
export const syncTabs = async (
  connectedTabsStore: KVStore<TabStore[]>,
  requester: ExtensionRequester
): Promise<TabStore[]> => {
  const tabs = await requester.queryBrowserTabIds();
  const storedTabs = (await connectedTabsStore.get(TAB_STORE_PREFIX)) || [];
  const currentTabs: TabStore[] = [];

  storedTabs?.forEach((tab: TabStore) => {
    if (tabs.includes(tab.tabId)) {
      currentTabs.push(tab);
    }
  });

  await connectedTabsStore.set(TAB_STORE_PREFIX, currentTabs);

  return currentTabs;
};

/**
 * Update tab storage: Either append to store, or update existing tab timestamp
 *
 * @param {number} senderTabId
 * @param {TabStore[]} tabs
 * @param {KVStore<TabStore[]>} connectedTabsStore
 *
 * @return Promise<void>
 */
export const updateTabStorage = async (
  senderTabId: number,
  tabs: TabStore[],
  connectedTabsStore: KVStore<TabStore[]>
): Promise<void> => {
  const tabIndex = tabs.findIndex((tab) => tab.tabId === senderTabId);

  if (tabIndex > -1) {
    // If tab exists, update timestamp
    tabs[tabIndex].timestamp = Date.now();
  } else {
    // Add tab to storage
    tabs.push({
      tabId: senderTabId,
      timestamp: Date.now(),
    });
  }
  return await connectedTabsStore.set(TAB_STORE_PREFIX, tabs);
};
