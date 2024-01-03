import { KVStore } from "@namada/storage";
import { Chain } from "@namada/types";
import { debounce } from "@namada/utils";

type ChainRemovedHandler = (chainId: string, identifier: string) => void;

export class ChainsService {
  protected onChainRemovedHandlers: ChainRemovedHandler[] = [];

  constructor(protected readonly kvStore: KVStore<Chain[]>) {}

  readonly getChains: () => Promise<Chain[]> = debounce(async () => {
    return [];
  });

  async getChain(chainId: string): Promise<Chain> {
    const chain = (await this.getChains()).find((chain) => {
      return chain.chainId === chainId;
    });

    if (!chain) {
      throw new Error(`There is no chain info for ${chainId}`);
    }
    return chain;
  }

  async hasChain(chainId: string): Promise<boolean> {
    return (
      (await this.getChains()).find((chain) => {
        return chain.chainId === chainId;
      }) != null
    );
  }
}
