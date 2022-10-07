import { DerivedAccount } from "./account";
import { Chain } from "./chain";

export type Account = {
  alias: string;
  address: string;
  publicKey: Uint8Array;
};

export interface Anoma {
  connect(chainId: string): Promise<void>;
  accounts(chainId: string): Promise<DerivedAccount[] | undefined>;
  suggestChain(chainConfig: Chain): Promise<void>;
  chain: (chainId: string) => Promise<Chain | undefined>;
  chains: () => Promise<Chain[] | undefined>;
  version: () => string;
}

export type WindowWithAnoma = Window &
  typeof globalThis & {
    anoma: Anoma;
  };
