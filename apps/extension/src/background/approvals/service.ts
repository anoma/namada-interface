import browser, { Windows } from "webextension-polyfill";
import { fromBase64 } from "@cosmjs/encoding";
import { v4 as uuid } from "uuid";
import BigNumber from "bignumber.js";
import { deserialize } from "@dao-xyz/borsh";

import {
  AccountType,
  IbcTransferMsgValue,
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

import { ApprovedOriginsStore } from "./types";
import { addApprovedOrigin, removeApprovedOrigin, APPROVED_ORIGINS_KEY } from "./utils";

export class ApprovalsService {

  // holds promises which can be resolved with a message from a pop-up window
  protected resolverMap: Record<
    number,
    { resolve: (result?: any) => void; reject: (error?: any) => void }
  > = {};

  constructor(
    protected readonly txStore: KVStore<string>,
    protected readonly connectedTabsStore: KVStore<TabStore[]>,
    protected readonly approvedOriginsStore: KVStore<ApprovedOriginsStore>,
    protected readonly keyRingService: KeyRingService,
    protected readonly ledgerService: LedgerService
  ) { }

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
    const baseUrl = `${browser.runtime.getURL("approvals.html")}#/approve-tx/${TxType.Transfer
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

  // Deserialize IBC transfer details and prompt user
  async approveIbcTransfer(txMsg: string, type: AccountType): Promise<void> {
    const txMsgBuffer = Buffer.from(fromBase64(txMsg));
    const msgId = uuid();
    await this.txStore.set(msgId, txMsg);

    // Decode tx details and launch approval screen
    const txDetails = deserialize(txMsgBuffer, IbcTransferMsgValue);
    const {
      source,
      receiver: target,
      token: tokenAddress,
      amount: amountBN,
      tx: { publicKey = "" },
    } = txDetails;

    const amount = new BigNumber(amountBN.toString());
    const baseUrl = `${browser.runtime.getURL("approvals.html")}#/approve-tx/${TxType.IBCTransfer
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
    const baseUrl = `${browser.runtime.getURL("approvals.html")}#/approve-tx/${TxType.Bond
      }`;

    const url = paramsToUrl(baseUrl, {
      msgId,
      source,
      tokenAddress,
      amount: amount.toString(),
      publicKey,
      accountType: type,
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
    const baseUrl = `${browser.runtime.getURL("approvals.html")}#/approve-tx/${TxType.Unbond
      }`;

    const url = paramsToUrl(baseUrl, {
      msgId,
      source,
      amount: amount.toString(),
      accountType: type,
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
    const baseUrl = `${browser.runtime.getURL("approvals.html")}#/approve-tx/${TxType.Withdraw
      }`;

    const url = paramsToUrl(baseUrl, {
      msgId,
      source,
      validator,
      publicKey,
      accountType: type,
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

  // Authenticate keyring and submit approved IBC transfer transaction from storage
  async submitIbcTransfer(msgId: string, password: string): Promise<void> {
    await this.keyRingService.unlock(password);

    // Fetch pending transfer tx
    const tx = await this.txStore.get(msgId);

    if (tx) {
      await this.keyRingService.submitIbcTransfer(tx, msgId);

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

  async approveConnection(
    interfaceTabId: number,
    chainId: string,
    interfaceOrigin: string
  ): Promise<void> {
    const baseUrl = `${browser.runtime.getURL("approvals.html")}#/approve-connection`;

    const url = paramsToUrl(baseUrl, {
      interfaceTabId: interfaceTabId.toString(),
      chainId,
      interfaceOrigin
    });

    const approvedOrigins = await this.approvedOriginsStore.get(APPROVED_ORIGINS_KEY) || [];

    if (!approvedOrigins.includes(interfaceOrigin)) {
      const approvalWindow = await this._launchApprovalWindow(url);
      const popupTabId = approvalWindow.tabs![0].id!;

      if (popupTabId in this.resolverMap) {
        throw new Error(`tab ID ${popupTabId} already exists in promise map`);
      }

      return new Promise((resolve, reject) => {
        this.resolverMap[popupTabId] = { resolve, reject };
      });
    }
  }

  async approveConnectionResponse(
    interfaceTabId: number,
    chainId: string,
    interfaceOrigin: string,
    allowConnection: boolean,
    popupTabId: number,
  ): Promise<void> {
    const resolvers = this.resolverMap[popupTabId];
    if (!resolvers) {
      throw new Error(`no resolvers found for tab ID ${interfaceTabId}`);
    }

    if (allowConnection) {
      await addApprovedOrigin(this.approvedOriginsStore, interfaceOrigin);
      await this.keyRingService.connect(interfaceTabId, chainId);
      resolvers.resolve();
    } else {
      resolvers.reject();
    }
  }

  async revokeConnection(originToRevoke: string): Promise<void> {
    return removeApprovedOrigin(this.approvedOriginsStore, originToRevoke);
  }

  private async _clearPendingTx(msgId: string): Promise<void> {
    return await this.txStore.set(msgId, null);
  }

  private _launchApprovalWindow = (url: string): Promise<Windows.Window> => {
    return browser.windows.create({
      url,
      width: 415,
      height: 510,
      type: "popup",
    });
  };
}
