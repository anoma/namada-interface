import browser from "webextension-polyfill";
import { fromBase64 } from "@cosmjs/encoding";
import { v4 as uuid } from "uuid";
import BigNumber from "bignumber.js";
import { deserialize } from "@dao-xyz/borsh";

import {
  AccountType,
  SubmitBondMsgValue,
  TransferMsgValue,
} from "@namada/types";
import { KVStore } from "@namada/storage";

import { KeyRingService, TabStore } from "background/keyring";
import { LedgerService } from "background/ledger";

export class ApprovalsService {
  constructor(
    protected readonly txStore: KVStore<string>,
    protected readonly connectedTabsStore: KVStore<TabStore[]>,
    protected readonly keyRingService: KeyRingService,
    protected readonly ledgerService: LedgerService
  ) { }

  // Deserialize transfer details and prompt user
  async approveTransfer(txMsg: string, type?: AccountType): Promise<void> {
    const txMsgBuffer = Buffer.from(fromBase64(txMsg));
    const id = uuid();
    await this.txStore.set(id, txMsg);

    // Decode tx details and launch approval screen
    const txDetails = deserialize(txMsgBuffer, TransferMsgValue);
    const { source, target, token, amount: amountBN } = txDetails;
    const amount = new BigNumber(amountBN.toString());
    const url = `${browser.runtime.getURL(
      "approvals.html"
    )}#/approve-transfer?type=${type}&id=${id}&source=${source}&target=${target}&token=${token}&amount=${amount}`;

    this._launchApprovalWindow(url);
  }

  // Deserialize bond details and prompt user
  async approveBond(
    txMsg: string,
    type: AccountType,
    publicKey?: string
  ): Promise<void> {
    const txMsgBuffer = Buffer.from(fromBase64(txMsg));
    const id = uuid();
    await this.txStore.set(id, txMsg);

    // Decode tx details and launch approval screen
    const txDetails = deserialize(txMsgBuffer, SubmitBondMsgValue);

    const { source, nativeToken, amount: amountBN } = txDetails;
    const amount = new BigNumber(amountBN.toString());
    let url = `${browser.runtime.getURL(
      "approvals.html"
    )}#/approve-bond?type=${type}&id=${id}&source=${source}&token=${nativeToken}&amount=${amount}`;

    if (publicKey) {
      url += `&publicKey=${publicKey}`;
    }

    this._launchApprovalWindow(url);
  }

  // Deserialize bond details and prompt user
  // TODO: Finish implementing!
  async approveUnbond(txMsg: string, type?: AccountType): Promise<void> {
    const txMsgBuffer = Buffer.from(fromBase64(txMsg));
    const id = uuid();
    await this.txStore.set(id, txMsg);

    // Decode tx details and launch approval screen
    const txDetails = deserialize(txMsgBuffer, SubmitBondMsgValue);

    const { source, nativeToken, amount: amountBN } = txDetails;
    const amount = new BigNumber(amountBN.toString());
    // TODO: This query should include perhaps a "type" indicating whether it's a bond or unbond tx:
    const url = `${browser.runtime.getURL(
      "approvals.html"
    )}#/approve-bond?type=${type}&id=${id}&source=${source}&token=${nativeToken}&amount=${amount}`;

    this._launchApprovalWindow(url);
  }

  // Remove pending transaction from storage
  async rejectTx(msgId: string): Promise<void> {
    await this._clearPendingTx(msgId);
  }

  // Authenticate keyring and submit approved transfer transaction from storage
  async submitTransfer(msgId: string, password: string): Promise<void> {
    try {
      await this.keyRingService.unlock(password);
    } catch (e) {
      throw new Error(`${e}`);
    }

    // Fetch pending transfer tx
    const tx = await this.txStore.get(msgId);

    if (tx) {
      await this.keyRingService.submitTransfer(tx, msgId);

      return await this._clearPendingTx(msgId);
    }

    throw new Error("Pending transfer not found!");
  }

  // Authenticate keyring and submit approved bond transaction from storage
  async submitBond(msgId: string, password: string): Promise<void> {
    try {
      await this.keyRingService.unlock(password);
    } catch (e) {
      throw new Error(`${e}`);
    }
    // Fetch pending bond tx
    const tx = await this.txStore.get(msgId);

    if (tx) {
      await this.keyRingService.submitBond(tx, msgId);
      await this.ledgerService.broadcastUpdateStaking();

      return await this._clearPendingTx(msgId);
    }

    throw new Error("Pending bond not found!");
  }

  async submitUnbond(msgId: string, password: string): Promise<void> {
    try {
      await this.keyRingService.unlock(password);
    } catch (e) {
      throw new Error(`${e}`);
    }
    // Fetch pending bond tx
    const tx = await this.txStore.get(msgId);

    if (tx) {
      await this.keyRingService.submitUnbond(tx, msgId);

      return await this._clearPendingTx(msgId);
    }

    throw new Error("Pending bond not found!");
  }

  private async _clearPendingTx(msgId: string): Promise<void> {
    return await this.txStore.set(msgId, null);
  }

  private _launchApprovalWindow = (url: string): void => {
    browser.windows.create({
      url,
      width: 415,
      height: 510,
      type: "popup",
    });
  };
}
