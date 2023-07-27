import browser from "webextension-polyfill";
import { fromBase64 } from "@cosmjs/encoding";
import { v4 as uuid } from "uuid";
import BigNumber from "bignumber.js";
import { deserialize } from "@dao-xyz/borsh";

import {
  AccountType,
  SubmitBondMsgValue,
  SubmitUnbondMsgValue,
  SubmitWithdrawMsgValue,
  TransferMsgValue,
} from "@namada/types";
import { TxType } from "@namada/shared";
import { KVStore } from "@namada/storage";

import { KeyRingService, TabStore } from "background/keyring";
import { LedgerService } from "background/ledger";
import { paramsToUrl } from "@namada/utils";

export class ApprovalsService {
  constructor(
    protected readonly txStore: KVStore<string>,
    protected readonly connectedTabsStore: KVStore<TabStore[]>,
    protected readonly keyRingService: KeyRingService,
    protected readonly ledgerService: LedgerService
  ) {}

  // Deserialize transfer details and prompt user
  async approveTransfer(txMsg: string, type: AccountType): Promise<void> {
    const txMsgBuffer = Buffer.from(fromBase64(txMsg));
    const msgId = uuid();
    await this.txStore.set(msgId, txMsg);

    // Decode tx details and launch approval screen
    const txDetails = deserialize(txMsgBuffer, TransferMsgValue);
    const {
      source,
      target,
      token: tokenAddress,
      amount: amountBN,
      tx: { publicKey = "" },
    } = txDetails;
    const amount = new BigNumber(amountBN.toString());
    const baseUrl = `${browser.runtime.getURL("approvals.html")}#/approve-tx/${
      TxType.Transfer
    }`;

    const url = paramsToUrl(baseUrl, {
      msgId,
      source,
      target,
      tokenAddress,
      amount: amount.toString(),
      accountType: type,
      publicKey,
    });

    this._launchApprovalWindow(url);
  }

  // Deserialize bond details and prompt user
  async approveBond(txMsg: string, type: AccountType): Promise<void> {
    const txMsgBuffer = Buffer.from(fromBase64(txMsg));
    const msgId = uuid();
    await this.txStore.set(msgId, txMsg);

    // Decode tx details and launch approval screen
    const txDetails = deserialize(txMsgBuffer, SubmitBondMsgValue);

    const {
      source,
      nativeToken: tokenAddress,
      amount: amountBN,
      tx: { publicKey = "" },
    } = txDetails;
    const amount = new BigNumber(amountBN.toString());
    const baseUrl = `${browser.runtime.getURL("approvals.html")}#/approve-tx/${
      TxType.Bond
    }`;

    const url = paramsToUrl(baseUrl, {
      msgId,
      source,
      tokenAddress,
      amount: amount.toString(),
      publicKey,
      accountType: type as string,
    });

    this._launchApprovalWindow(url);
  }

  // Deserialize unbond details and prompt user
  async approveUnbond(txMsg: string, type: AccountType): Promise<void> {
    const txMsgBuffer = Buffer.from(fromBase64(txMsg));
    const msgId = uuid();
    await this.txStore.set(msgId, txMsg);

    // Decode tx details and launch approval screen
    const txDetails = deserialize(txMsgBuffer, SubmitUnbondMsgValue);

    const {
      source,
      amount: amountBN,
      tx: { publicKey = "" },
    } = txDetails;
    const amount = new BigNumber(amountBN.toString());
    const baseUrl = `${browser.runtime.getURL("approvals.html")}#/approve-tx/${
      TxType.Unbond
    }`;

    const url = paramsToUrl(baseUrl, {
      msgId,
      source,
      amount: amount.toString(),
      accountType: type as string,
      publicKey,
    });

    this._launchApprovalWindow(url);
  }

  // Deserialize withdraw details and prompt user
  async approveWithdraw(txMsg: string, type: AccountType): Promise<void> {
    const txMsgBuffer = Buffer.from(fromBase64(txMsg));
    const msgId = uuid();
    await this.txStore.set(msgId, txMsg);

    // Decode tx details and launch approval screen
    const txDetails = deserialize(txMsgBuffer, SubmitWithdrawMsgValue);

    const {
      source,
      validator,
      tx: { publicKey = "" },
    } = txDetails;
    const baseUrl = `${browser.runtime.getURL("approvals.html")}#/approve-tx/${
      TxType.Withdraw
    }`;

    const url = paramsToUrl(baseUrl, {
      msgId,
      source,
      validator,
      publicKey,
      accountType: type as string,
    });

    this._launchApprovalWindow(url);
  }
  // Remove pending transaction from storage
  async rejectTx(msgId: string): Promise<void> {
    await this._clearPendingTx(msgId);
  }

  // Authenticate keyring and submit approved transfer transaction from storage
  async submitTransfer(msgId: string, password: string): Promise<void> {
    await this.keyRingService.unlock(password);

    // Fetch pending transfer tx
    const tx = await this.txStore.get(msgId);

    if (tx) {
      await this.keyRingService.submitTransfer(tx, msgId);

      return await this._clearPendingTx(msgId);
    }

    throw new Error("Pending Transfer tx not found!");
  }

  // Authenticate keyring and submit approved bond transaction from storage
  async submitBond(msgId: string, password: string): Promise<void> {
    await this.keyRingService.unlock(password);

    // Fetch pending bond tx
    const tx = await this.txStore.get(msgId);

    if (tx) {
      await this.keyRingService.submitBond(tx, msgId);
      await this.ledgerService.broadcastUpdateStaking();

      return await this._clearPendingTx(msgId);
    }

    throw new Error("Pending Bond tx not found!");
  }

  async submitUnbond(msgId: string, password: string): Promise<void> {
    await this.keyRingService.unlock(password);

    // Fetch pending bond tx
    const tx = await this.txStore.get(msgId);

    if (tx) {
      await this.keyRingService.submitUnbond(tx, msgId);

      return await this._clearPendingTx(msgId);
    }

    throw new Error("Pending Unbond tx not found!");
  }

  async submitWithdraw(msgId: string, password: string): Promise<void> {
    await this.keyRingService.unlock(password);

    // Fetch pending bond tx
    const tx = await this.txStore.get(msgId);

    if (tx) {
      await this.keyRingService.submitWithdraw(tx, msgId);

      return await this._clearPendingTx(msgId);
    }

    throw new Error("Pending Withdraw tx not found!");
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
