import { KVStore } from "@anoma/storage";
import { ExtensionRequester } from "extension";

export class ApprovalsService {
  constructor(
    protected readonly txStore: KVStore<string>,
    protected readonly requester: ExtensionRequester
  ) { }

  async submitTx(txMsg: string): Promise<void> {
    console.log("ApprovalsService.submitTx()", txMsg);

    return;
  }
}
