import { ChainRegistryEntry } from "types";

export interface WalletConnector {
  get(): unknown;
  connect(registry: ChainRegistryEntry): Promise<void>;
  getAddress(chainId: string): Promise<string>;
  getSigner(chainId: string): unknown | undefined;
}
