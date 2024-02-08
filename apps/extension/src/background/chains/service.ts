import { chains } from "@namada/chains";
import { Query } from "@namada/shared";
import { KVStore } from "@namada/storage";
import { Chain } from "@namada/types";
import { ExtensionBroadcaster } from "extension";

export const CHAINS_KEY = "chains";

export class ChainsService {
  constructor(
    protected readonly chainsStore: KVStore<Chain>,
    protected readonly broadcaster: ExtensionBroadcaster
  ) {
    this._initChain();
  }

  private async _queryNativeToken(chain: Chain): Promise<Chain> {
    const query = new Query(chain.rpc);
    try {
      const nativeToken = await query.query_native_token();
      if (nativeToken) {
        chain.currency.address = nativeToken;
      }
    } catch (e) {
      console.warn(`Chain is unreachable: ${e}`);
    }

    await this.chainsStore.set(CHAINS_KEY, chain);
    return chain;
  }

  private async _initChain(): Promise<void> {
    // Initialize default chain in storage
    const chain = (await this.chainsStore.get(CHAINS_KEY)) || chains.namada;
    // Default chain config does not have a token address, so we query:
    if (!chain.currency.address) {
      this._queryNativeToken(chain);
    }
  }

  async getChain(): Promise<Chain> {
    let chain = (await this.chainsStore.get(CHAINS_KEY)) || chains.namada;
    // If a previous query for native token failed, attempt again:
    if (!chain.currency.address) {
      chain = await this._queryNativeToken(chain);
    }
    return chain;
  }

  async updateChain(chainId: string, url: string): Promise<void> {
    let chain = await this.getChain();
    if (!chain) {
      throw new Error("No chain found!");
    }
    // Update RPC & Chain ID, then query for native token
    chain = {
      ...chain,
      chainId,
      rpc: url,
    };
    await this.chainsStore.set(CHAINS_KEY, await this._queryNativeToken(chain));
    this.broadcaster.updateNetwork();
  }
}
