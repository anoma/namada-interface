import { AccountChangedEventMsg } from "content/events";
import { ExtensionRequester } from "extension";
import { Ports } from "router";

export class ContentService {
  constructor(private readonly requester: ExtensionRequester) {}

  async handleAccountChanged(
    chainId: string,
    senderTabId: number
  ): Promise<void> {
    return this.requester.sendMessageToTab(
      senderTabId,
      Ports.WebBrowser,
      new AccountChangedEventMsg(chainId)
    );
  }
}
