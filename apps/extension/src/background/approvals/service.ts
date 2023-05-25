import browser from "webextension-polyfill";
import { fromBase64 } from "@cosmjs/encoding";
import { deserialize } from "borsh";
import { v4 as uuid } from "uuid";

import { SubmitTransferMsgSchema, TransferMsgValue } from "@anoma/types";
import { amountFromMicro } from "@anoma/utils";
import { KVStore } from "@anoma/storage";

import { ExtensionRequester } from "extension";

export class ApprovalsService {
  constructor(
    protected readonly txStore: KVStore<string>,
    protected readonly requester: ExtensionRequester
  ) { }

  async submitTx(txMsg: string): Promise<void> {
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
}
