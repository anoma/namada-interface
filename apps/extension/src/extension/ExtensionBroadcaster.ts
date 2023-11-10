import { TxType } from "@namada/shared";
import { KVStore } from "@namada/storage";
import { TabStore, syncTabs } from "background/keyring";
import {
  AccountChangedEventMsg,
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
    protected readonly chainId: string,
    protected readonly requester: ExtensionRequester
  ) {}

  async startTx(msgId: string, txType: TxType): Promise<void> {
    await this.sendMsgToTabs(new TxStartedEvent(this.chainId, msgId, txType));
  }

  async completeTx(
    msgId: string,
    txType: TxType,
    success: boolean,
    payload?: string
  ): Promise<void> {
    await this.sendMsgToTabs(
      new TxCompletedEvent(this.chainId, msgId, txType, success, payload)
    );
  }

  async updateBalance(): Promise<void> {
    await this.sendMsgToTabs(new UpdatedBalancesEventMsg(this.chainId));
  }

  async updateStaking(): Promise<void> {
    await this.sendMsgToTabs(new UpdatedStakingEventMsg(this.chainId));
  }

  async updateAccounts(): Promise<void> {
    await this.sendMsgToTabs(new AccountChangedEventMsg(this.chainId));
  }

  async updateProposals(): Promise<void> {
    await this.sendMsgToTabs(new ProposalsUpdatedEventMsg(this.chainId));
  }

  async lockExtension(): Promise<void> {
    await this.sendMsgToTabs(new VaultLockedEventMsg());
  }

  /**
   * Query all existing tabs, and send provided message to each
   */
  async sendMsgToTabs(msg: Message<unknown>): Promise<void> {
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
