import browser from "webextension-polyfill";
import { fromBase64 } from "@cosmjs/encoding";
import { deserialize } from "borsh";
import { v4 as uuid } from "uuid";

import { SubmitTransferMsgSchema, TransferMsgValue } from "@anoma/types";
import { amountFromMicro } from "@anoma/utils";
import { KVStore } from "@anoma/storage";

import { ExtensionRequester } from "extension";
import { KeyRingService } from "background/keyring";
import { TabStore } from "background/keyring";

export class ApprovalsService {
  constructor(
    protected readonly txStore: KVStore<string>,
    protected readonly connectedTabsStore: KVStore<TabStore[]>,
    protected readonly keyRingService: KeyRingService,
    protected readonly chainId: string,
    protected readonly requester: ExtensionRequester
  ) { }

  // Deserialize transfer details and prompt user
  async approveTx(txMsg: string): Promise<void> {
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
    const amount = amountFromMicro(amountBN.toNumber());
    const url = `${browser.runtime.getURL(
      "approvals.html"
    )}#/tx?id=${id}&source=${source}&target=${target}&token=${token}&amount=${amount}`;

    browser.windows.create({
      url,
      width: 415,
      height: 510,
      type: "popup",
    });

    return;
  }

  // Remove pending transaction from storage
  async rejectTx(txId: string): Promise<void> {
    await this._clearPendingTx(txId);
  }

  // Authenticate keyring, submit approved transaction from storage
  async submitTx(txId: string, password: string): Promise<void> {
    // TODO: Use executeUntil here:
    try {
      await this.keyRingService.unlock(password);
    } catch (e) {
      throw new Error(`${e}`);
    }

    const tx = await this.txStore.get(txId);

    if (tx) {
      await this.keyRingService.submitTransfer(tx, txId);
      // Clean up storage
      return await this._clearPendingTx(txId);
    }

    throw new Error("Pending transfer not found!");
  }

  private async _clearPendingTx(txId: string): Promise<void> {
    return await this.txStore.set(txId, null);
  }
}
