import browser from "webextension-polyfill";

/**
 * Extension-specific utilities
 */

export const closeCurrentTab = async (): Promise<void> => {
  const tab = await browser.tabs.getCurrent();
  if (tab.id) {
    browser.tabs.remove(tab.id);
  }
};
