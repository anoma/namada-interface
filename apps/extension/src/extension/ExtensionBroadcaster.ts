import { TxType } from "@namada/shared";
import { KVStore } from "@namada/storage";
import { TabStore, syncTabs } from "background/keyring";
import {
  AccountChangedEventMsg,
  NetworkChangedEventMsg,
  ProposalsUpdatedEventMsg,
  TxCompletedEvent,
  TxStartedEvent,
  UpdatedBalancesEventMsg,
  UpdatedStakingEventMsg,
  VaultLockedEventMsg,
} from "content/events";
import { ExtensionRequester } from "extension";
import { Message, Ports } from "router";

export class ExtensionBroadcaster {
  constructor(
    protected readonly connectedTabsStore: KVStore<TabStore[]>,
    protected readonly requester: ExtensionRequester
  ) {}

  async startTx(msgId: string, txType: TxType): Promise<void> {
    await this.sendMsgToTabs(new TxStartedEvent(msgId, txType));
  }

  async completeTx(
    msgId: string,
    txType: TxType,
    success: boolean,
    payload?: string
  ): Promise<void> {
    await this.sendMsgToTabs(
      new TxCompletedEvent(msgId, txType, success, payload)
    );
  }

  async updateBalance(): Promise<void> {
    await this.sendMsgToTabs(new UpdatedBalancesEventMsg());
  }

  async updateStaking(): Promise<void> {
    await this.sendMsgToTabs(new UpdatedStakingEventMsg());
  }

  async updateAccounts(): Promise<void> {
    await this.sendMsgToTabs(new AccountChangedEventMsg());
  }

  async updateNetwork(): Promise<void> {
    await this.sendMsgToTabs(new NetworkChangedEventMsg());
  }

  async updateProposals(): Promise<void> {
    await this.sendMsgToTabs(new ProposalsUpdatedEventMsg());
  }

  async lockExtension(): Promise<void> {
    await this.sendMsgToTabs(new VaultLockedEventMsg());
  }

  /**
   * Query all existing tabs, and send provided message to each
   */
  async sendMsgToTabs(msg: Message<unknown>): Promise<void> {
    const tabs = await syncTabs(this.connectedTabsStore, this.requester);

    try {
      tabs?.forEach(({ tabId }: TabStore) => {
        this.requester.sendMessageToTab(tabId, Ports.WebBrowser, msg);
      });
    } catch (e) {
      console.warn(e);
    }
  }
}
