import { ChainRegistryEntry } from "types";

export type AttachStatus = "pending" | "attached" | "detached";
export type ConnectStatus = "idle" | "connecting" | "connected" | "error";

// Generic wallet functionality
export interface Wallet {
  install(): void;
  get(): unknown;
  connect(chainId: string): Promise<void>;
}

// For use with useWalletManager
export interface WalletConnector extends Omit<Wallet, "connect"> {
  connect(registry: ChainRegistryEntry): Promise<void>;
  getAddress(chainId: string): Promise<string>;
  getSigner(chainId: string): unknown | undefined;
}
