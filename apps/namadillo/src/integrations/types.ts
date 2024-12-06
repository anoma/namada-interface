import { ExtensionKey } from "@namada/types";
import { ChainRegistryEntry } from "types";

// Generic wallet functionality
export interface Wallet {
  install(): void;
  get(): unknown;
  connect(chainId: string): Promise<void>;
}

// For use with useWalletManager
export interface WalletConnector extends Omit<Wallet, "connect"> {
  key: ExtensionKey;
  connect(registry: ChainRegistryEntry): Promise<void>;
  getAddress(chainId: string): Promise<string>;
  getSigner(chainId: string): unknown | undefined;
}
