import { chains } from "@namada/chains";
import { Query } from "@namada/shared";
import { KVStore } from "@namada/storage";
import { Chain } from "@namada/types";
import { ExtensionBroadcaster } from "extension";

const {
  NAMADA_INTERFACE_NAMADA_TOKEN:
  tokenAddress = "tnam1qxgfw7myv4dh0qna4hq0xdg6lx77fzl7dcem8h7e",
} = process.env;

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
      const {
        currency: { address },
      } = defaultChain;
      if (!address) {
        const query = new Query(defaultChain.rpc);
        const nativeToken = await query.query_native_token();
        defaultChain.currency.address = nativeToken || tokenAddress;
      }

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
    let {
      currency: { address },
    } = chain;

    // Attempt to fetch native token, fallback to env
    if (!address) {
      const query = new Query(chain.rpc);
      const nativeToken = await query.query_native_token();
      address = nativeToken || tokenAddress;
    }

    await this.chainsStore.set(CHAINS_KEY, {
      ...chain,
      chainId,
      rpc: url,
      currency: {
        ...chain.currency,
        address,
      },
    });
    this.broadcaster.updateNetwork();
  }
}
