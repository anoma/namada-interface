// import { KVStore } from "@namada/storage";
// import { debounce } from "@namada/utils";
// import { Chain } from "@namada/types";
// import { Env, KVKeys } from "router";
//
// type ChainRemovedHandler = (chainId: string, identifier: string) => void;
//
// export class ChainsService {
//   protected onChainRemovedHandlers: ChainRemovedHandler[] = [];
//
//   constructor(
//     protected readonly kvStore: KVStore<Chain[]>,
//     protected readonly defaultChains: Chain[]
//   ) {}
//
//   readonly getChains: () => Promise<Chain[]> = debounce(async () => {
//     const chains = [...this.defaultChains];
//     const suggestedChains: Chain[] = await this.getSuggestedChains();
//     return chains.concat(suggestedChains);
//   });
//
//   async getChain(chainId: string): Promise<Chain> {
//     const chain = (await this.getChains()).find((chain) => {
//       return chain.chainId === chainId;
//     });
//
//     if (!chain) {
//       throw new Error(`There is no chain info for ${chainId}`);
//     }
//     return chain;
//   }
//
//   async getChainCoinType(chainId: string): Promise<number> {
//     const chain = await this.getChain(chainId);
//
//     if (!chain) {
//       throw new Error(`There is no chain info for ${chainId}`);
//     }
//
//     return chain.bip44.coinType;
//   }
//
//   async hasChain(chainId: string): Promise<boolean> {
//     return (
//       (await this.getChains()).find((chain) => {
//         return chain.chainId === chainId;
//       }) != null
//     );
//   }
//
//   async suggestChain(env: Env, chain: Chain, origin: string): Promise<void> {
//     // TODO: Validate against schema
//     // chain = await ChainSchema.validateAsync(chain, {
//     //   stripUnknown: true,
//     // });
//     console.info("suggestChain", { env, chain, origin });
//     await this.addChain(chain);
//   }
//
//   async getSuggestedChains(): Promise<Chain[]> {
//     return (await this.kvStore.get(KVKeys.Chains)) ?? [];
//   }
//
//   async addChain(chain: Chain): Promise<void> {
//     const { chainId } = chain;
//     if (await this.hasChain(chainId)) {
//       throw new Error(`Chain with ID ${chainId} is already registered`);
//     }
//
//     const savedChains = (await this.kvStore.get(KVKeys.Chains)) ?? [];
//
//     savedChains.push(chain);
//
//     await this.kvStore.set(KVKeys.Chains, savedChains);
//   }
//
//   async removeChain(chainId: string): Promise<void> {
//     if (!(await this.hasChain(chainId))) {
//       throw new Error("Chain is not registered");
//     }
//
//     const chains = (await this.kvStore.get(KVKeys.Chains)) ?? [];
//
//     const filteredChains = chains.filter((chain: Chain) => {
//       return chain.chainId !== chainId;
//     });
//
//     await this.kvStore.set(KVKeys.Chains, filteredChains);
//   }
//
//   addChainRemovedHandler(handler: ChainRemovedHandler): void {
//     this.onChainRemovedHandlers.push(handler);
//   }
// }
