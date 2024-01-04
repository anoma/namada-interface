import { Query, Sdk } from "@namada/shared";
import { KVStore } from "@namada/storage";
import { Chain } from "@namada/types";
import { CHAINS_KEY } from "background/chains";

export class SdkService {
  constructor(protected readonly chainStore: KVStore<Chain>) { }

  private async _getRpc(): Promise<string> {
    // Pull chain config from store, as the RPC value may have changed:
    const chain = await this.chainStore.get(CHAINS_KEY);

    if (!chain) {
      throw new Error("No chain found!");
    }
    const { rpc } = chain;
    return rpc;
  }

  async getSdk(): Promise<Sdk> {
    const rpc = await this._getRpc();
    return new Sdk(rpc);
  }

  async getQuery(): Promise<Query> {
    const rpc = await this._getRpc();
    return new Query(rpc);
  }
}
