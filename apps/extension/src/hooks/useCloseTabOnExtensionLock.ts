import { useEventListener } from "@namada/hooks";
import { useRequester } from "./useRequester";
import { Events } from "@namada/types";
import { Ports } from "router";
import { CheckPasswordInitializedMsg } from "background/vault";
import browser from "webextension-polyfill";

export const useCloseTabOnExtensionLock = (): void => {
  const requester = useRequester();

  useEventListener(Events.ExtensionLocked, async () => {
    const passwordInitialized = await requester.sendMessage(
      Ports.Background,
      new CheckPasswordInitializedMsg()
    );

    if (passwordInitialized) {
      const tab = await browser.tabs.getCurrent();
      if (tab.id) {
        browser.tabs.remove(tab.id);
      }
    }
  });
};
