import { useEventListener } from "@namada/hooks";
import { Events } from "@namada/types";
import { CheckPasswordInitializedMsg } from "background/vault";
import { Ports } from "router";
import browser from "webextension-polyfill";
import { useRequester } from "./useRequester";

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
        await browser.tabs.remove(tab.id);
      }
    }
  });
};
