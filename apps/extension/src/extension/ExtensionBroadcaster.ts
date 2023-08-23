import { TxType } from "@namada/shared";
import { KVStore } from "@namada/storage";
import { TabStore, syncTabs } from "background/keyring";
import {
  TxCompletedEvent,
  TxStartedEvent,
  UpdatedBalancesEventMsg,
  UpdatedStakingEventMsg,
} from "content/events";
import { ExtensionRequester } from "extension";
import { Message, Ports } from "router";

export class ExtensionBroadcaster {
  constructor(
    protected readonly connectedTabsStore: KVStore<TabStore[]>,
    protected readonly chainId: string,
    protected readonly requester: ExtensionRequester
  ) { }

  async startTx(msgId: string, txType: TxType): Promise<void> {
    try {
      await this.sendMsgToTabs(new TxStartedEvent(this.chainId, msgId, txType));
    } catch (e) {
      console.warn(`${e}`);
    }
  }

  async completeTx(
    msgId: string,
    txType: TxType,
    success: boolean,
    payload?: string
  ): Promise<void> {
    if (!success) {
      //TODO: pass error message to the TxCompletedEvent and display it in the UI
      console.error(payload);
    }
    try {
      await this.sendMsgToTabs(
        new TxCompletedEvent(this.chainId, msgId, txType)
      );
    } catch (e) {
      console.warn(`${e}`);
    }
  }

  async updateBalance(): Promise<void> {
    try {
      await this.sendMsgToTabs(new UpdatedBalancesEventMsg(this.chainId));
    } catch (e) {
      console.warn(e);
    }
  }

  async updateStaking(): Promise<void> {
    try {
      await this.sendMsgToTabs(new UpdatedStakingEventMsg(this.chainId));
    } catch (e) {
      console.warn(e);
    }
  }

  private async sendMsgToTabs(msg: Message<unknown>): Promise<void> {
    const tabs = await syncTabs(
      this.connectedTabsStore,
      this.requester,
      this.chainId
    );

    try {
      tabs?.forEach(({ tabId }: TabStore) => {
        this.requester.sendMessageToTab(tabId, Ports.WebBrowser, msg);
      });
    } catch (e) {
      console.warn(e);
    }
  }
}
