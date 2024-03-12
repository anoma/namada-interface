import { TxType } from "@namada/shared";
import { TabStore, syncTabs } from "background/keyring";
import {
  AccountChangedEventMsg,
  ConnectionRevokedEventMsg,
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
import { LocalStorage } from "storage";

export class ExtensionBroadcaster {
  constructor(
    protected readonly localStorage: LocalStorage,
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

  async revokeConnection(): Promise<void> {
    await this.sendMsgToTabs(new ConnectionRevokedEventMsg());
  }

  /**
   * Query all existing tabs, and send provided message to each
   */
  async sendMsgToTabs(msg: Message<unknown>): Promise<void> {
    const tabs = await syncTabs(this.localStorage, this.requester);

    try {
      tabs?.forEach(({ tabId }: TabStore) => {
        // We do not care about the result or the order of sendMessageToTab
        void this.requester.sendMessageToTab(tabId, Ports.WebBrowser, msg);
      });
    } catch (e) {
      console.warn(e);
    }
  }
}
