import { ChainRegistryEntry } from "types";

export interface WalletInterface {
  connect(registry: ChainRegistryEntry): Promise<void>;
  loadWalletAddress(chainId: string): Promise<string>;
  getSigner(chainId: string): unknown | undefined;
}
