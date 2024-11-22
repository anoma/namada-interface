import { WindowWithNamada } from "@namada/types";
import { ChainRegistryEntry } from "types";

export type NamadaKeychain = WindowWithNamada["namada"];

export interface WalletConnector {
  install(): void;
  get(): unknown;
  connect(registry: ChainRegistryEntry): Promise<void>;
  getAddress(chainId: string): Promise<string>;
  getSigner(chainId: string): unknown | undefined;
}
