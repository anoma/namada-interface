import { chains } from "@namada/chains";
import { KVStore } from "@namada/storage";
import { Chain } from "@namada/types";
import { ExtensionBroadcaster } from "extension";

export const CHAINS_KEY = "chains";

export class ChainsService {
  constructor(
    protected readonly chainsStore: KVStore<Chain>,
    protected readonly broadcaster: ExtensionBroadcaster
  ) { }

  async getChain(): Promise<Chain> {
    const chain = await this.chainsStore.get(CHAINS_KEY);
    if (!chain) {
      // Initialize default chain in storage
      const defaultChain = chains.namada;
      await this.chainsStore.set(CHAINS_KEY, defaultChain);
      return defaultChain;
    }
    return chain;
  }

  async updateChain(chainId: string, url: string): Promise<void> {
    const chain = await this.getChain();
    if (!chain) {
      throw new Error("No chain found!");
    }
    await this.chainsStore.set(CHAINS_KEY, {
      ...chain,
      chainId,
      rpc: url,
    });
    this.broadcaster.updateNetwork();
  }
}
