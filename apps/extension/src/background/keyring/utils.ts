import { ExtensionRequester } from "extension";
import { LocalStorage } from "storage";
import { TabStore } from "./types";

/**
 * Utility to sync tabs in storage with currently available tabs in browser
 *
 * @param {LocalStorage} localStorage
 * @param {ExtensionRequester} requester
 *
 * @return Promise<TabStore[]>
 */
export const syncTabs = async (
  localStorage: LocalStorage,
  requester: ExtensionRequester
): Promise<TabStore[]> => {
  const tabs = await requester.queryBrowserTabIds();
  const storedTabs = (await localStorage.getTabs()) || [];
  const currentTabs: TabStore[] = [];

  storedTabs?.forEach((tab: TabStore) => {
    if (tabs.includes(tab.tabId)) {
      currentTabs.push(tab);
    }
  });

  await localStorage.setTabs(currentTabs);

  return currentTabs;
};

/**
 * Update tab storage: Either append to store, or update existing tab timestamp
 *
 * @param {number} senderTabId
 * @param {TabStore[]} tabs
 * @param {LocalStorage} localStorage
 *
 * @return Promise<void>
 */
export const updateTabStorage = async (
  senderTabId: number,
  tabs: TabStore[],
  localStorage: LocalStorage
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
  return await localStorage.setTabs(tabs);
};
