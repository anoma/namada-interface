import {
  AccountChangedEventMsg,
  ConnectionRevokedEventMsg,
  NetworkChangedEventMsg,
  VaultLockedEventMsg,
  VaultUnlockedEventMsg,
} from "content/events";
import { ExtensionRequester } from "extension";
import { Message, Ports } from "router";
import { LocalStorage } from "storage";

export class ExtensionBroadcaster {
  constructor(
    protected readonly localStorage: LocalStorage,
    protected readonly requester: ExtensionRequester
  ) {}

  async updateAccounts(): Promise<void> {
    await this.sendMsgToTabs(new AccountChangedEventMsg());
  }

  async updateNetwork(): Promise<void> {
    await this.sendMsgToTabs(new NetworkChangedEventMsg());
  }

  async lockExtension(): Promise<void> {
    await this.sendMsgToTabs(new VaultLockedEventMsg());
  }

  async unlockExtension(): Promise<void> {
    await this.sendMsgToTabs(new VaultUnlockedEventMsg());
  }

  async revokeConnection(): Promise<void> {
    await this.sendMsgToTabs(new ConnectionRevokedEventMsg());
  }

  /**
   * Query all existing tabs, and send provided message to each
   */
  async sendMsgToTabs(msg: Message<unknown>): Promise<void> {
    const tabIds = await this.requester.queryBrowserTabIds();

    try {
      tabIds.forEach((tabId: number) => {
        // We do not care about the result or the order of sendMessageToTab
        void this.requester.sendMessageToTab(tabId, Ports.WebBrowser, msg);
      });
    } catch (e) {
      console.warn(e);
    }
  }
}
