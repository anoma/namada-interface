import { chains, defaultChainId } from "@namada/chains";
import { KVStore } from "@namada/storage";
import { Chain } from "@namada/types";

export const CHAINS_KEY = "chains";

export class ChainsService {
  constructor(protected readonly chainsStore: KVStore<Chain>) { }

  async getChain(): Promise<Chain | undefined> {
    const chain = await this.chainsStore.get(CHAINS_KEY);
    if (!chain) {
      // Initialize default chain in storage
      const defaultChain = chains[defaultChainId];
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
    return await this.chainsStore.set(CHAINS_KEY, {
      ...chain,
      chainId,
      rpc: url,
    });
  }
}
