import { TxType } from "@namada/sdk/web";
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
    options?: {
      txHash?: string;
      error?: { code: "REJECTED" | "UNKNOWN"; message?: string };
    }
  ): Promise<void> {
    await this.sendMsgToTabs(
      new TxCompletedEvent(
        msgId,
        txType,
        success,
        options?.txHash,
        options?.error
      )
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
