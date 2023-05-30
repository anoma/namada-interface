import browser from "webextension-polyfill";
import { fromBase64 } from "@cosmjs/encoding";
import { deserialize } from "borsh";
import { v4 as uuid } from "uuid";
import BigNumber from "bignumber.js";

import {
  AccountType,
  SubmitTransferMsgSchema,
  TransferMsgValue,
} from "@anoma/types";
import { KVStore } from "@anoma/storage";

import { KeyRingService, TabStore } from "background/keyring";
import { LedgerService } from "background/ledger";

export class ApprovalsService {
  constructor(
    protected readonly txStore: KVStore<string>,
    protected readonly connectedTabsStore: KVStore<TabStore[]>,
    protected readonly keyRingService: KeyRingService,
    protected readonly ledgerService: LedgerService
  ) {}

  // Deserialize transfer details and prompt user
  async approveTransfer(txMsg: string, type?: AccountType): Promise<void> {
    const txMsgBuffer = Buffer.from(fromBase64(txMsg));
    const id = uuid();
    this.txStore.set(id, txMsg);

    // Decode tx details and launch approval screen
    const txDetails = deserialize(
      SubmitTransferMsgSchema,
      TransferMsgValue,
      txMsgBuffer
    );
    const { source, target, token, amount: amountBN } = txDetails;
    const amount = new BigNumber(amountBN.toString());
    const url = `${browser.runtime.getURL(
      "approvals.html"
    )}#/tx?type=${type}&id=${id}&source=${source}&target=${target}&token=${token}&amount=${amount}`;

    browser.windows.create({
      url,
      width: 415,
      height: 510,
      type: "popup",
    });

    return;
  }

  // Remove pending transaction from storage
  async rejectTransfer(msgId: string): Promise<void> {
    await this._clearPendingTx(msgId);
  }

  // Authenticate keyring and submit approved transaction from storage
  async submitTransfer(msgId: string, password: string): Promise<void> {
    try {
      await this.keyRingService.unlock(password);
    } catch (e) {
      throw new Error(`${e}`);
    }

    // Fetch pending tx
    const tx = await this.txStore.get(msgId);

    // Validate account type
    if (tx) {
      await this.keyRingService.submitTransfer(tx, msgId);

      return await this._clearPendingTx(msgId);
    }

    throw new Error("Pending transfer not found!");
  }

  private async _clearPendingTx(msgId: string): Promise<void> {
    return await this.txStore.set(msgId, null);
  }
}
