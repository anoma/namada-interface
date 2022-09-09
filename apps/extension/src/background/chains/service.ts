import { ChainInfo as Chain } from "@keplr-wallet/types";
import { KVStore } from "@anoma/storage";
import { debounce } from "@anoma/utils";
import { Env } from "../../router";

type ChainRemovedHandler = (chainId: string, identifier: string) => void;

export class ChainsService {
  protected onChainRemovedHandlers: ChainRemovedHandler[] = [];
  protected cachedChains: Chain[] | undefined;

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly defaultChains: Chain[]
  ) {
    this.kvStore = kvStore;
  }

  init() {
    console.debug("ChainsService initialized");
  }

  readonly getChains: () => Promise<any[]> = debounce(async () => {
    if (this.cachedChains) {
      return this.cachedChains;
    }

    const chains = [...this.defaultChains];
    const suggestedChains: Chain[] = await this.getSuggestedChains();
    let result: Chain[] = chains.concat(suggestedChains);

    return result;
  });

  clearCachedChains() {
    this.cachedChains = undefined;
  }

  async getChain(chainId: string): Promise<Chain> {
    const chain = (await this.getChains()).find((chain) => {
      return chain.chainId === chainId;
    });

    if (!chain) {
      throw new Error(`There is no chain info for ${chainId}`);
    }
    return chain;
  }

  async getChainCoinType(chainId: string): Promise<number> {
    const chain = await this.getChain(chainId);

    if (!chain) {
      throw new Error(`There is no chain info for ${chainId}`);
    }

    return chain.bip44.coinType;
  }

  async hasChain(chainId: string): Promise<boolean> {
    return (
      (await this.getChains()).find((chain) => {
        return chain.chainId === chainId;
      }) != null
    );
  }

  async suggestChain(env: Env, chain: Chain, origin: string): Promise<void> {
    // TODO: Validate against schema
    // chain = await ChainSchema.validateAsync(chain, {
    //   stripUnknown: true,
    // });
    console.info("suggestChain", { env, chain, origin });
    await this.addChain(chain);
  }

  async getSuggestedChains(): Promise<Chain[]> {
    return (await this.kvStore.get<Chain[]>("chain-infos")) ?? [];
  }

  async addChain(chain: Chain): Promise<void> {
    const { chainId } = chain;
    if (await this.hasChain(chainId)) {
      throw new Error(`Chain with ID ${chainId} is already registered`);
    }

    const savedChains = (await this.kvStore.get<Chain[]>("chain-infos")) ?? [];

    savedChains.push(chain);

    await this.kvStore.set<Chain[]>("chain-infos", savedChains);

    this.clearCachedChains();
  }

  async removeChain(chainId: string): Promise<void> {
    if (!(await this.hasChain(chainId))) {
      throw new Error("Chain is not registered");
    }

    const savedChains = (await this.kvStore.get<Chain[]>("chain-infos")) ?? [];

    const resultChain = savedChains.filter((chain: Chain) => {
      return chain.chainId !== chainId;
    });

    await this.kvStore.set<Chain[]>("chain-infos", resultChain);

    this.clearCachedChains();
  }

  addChainRemovedHandler(handler: ChainRemovedHandler) {
    this.onChainRemovedHandlers.push(handler);
  }
}
