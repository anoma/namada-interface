import { DerivedAccount } from "./account";
import { Chain } from "./chain";
import { Signer } from "./signer";

export interface Anoma {
  connect(chainId: string): Promise<void>;
  accounts(chainId: string): Promise<DerivedAccount[] | undefined>;
  balances(
    owner: string
  ): Promise<{ token: string; amount: number }[] | undefined>;
  suggestChain(chainConfig: Chain): Promise<void>;
  chain: (chainId: string) => Promise<Chain | undefined>;
  chains: () => Promise<Chain[] | undefined>;
  submitBond: (txMsg: string) => Promise<void>;
  submitUnbond: (txMsg: string) => Promise<void>;
  submitTransfer: (txMsg: string) => Promise<void>;
  submitIbcTransfer: (txMsg: string) => Promise<void>;
  encodeInitAccount: (props: {
    txMsg: string;
    address: string;
  }) => Promise<string | undefined>;
  version: () => string;
}

export type WindowWithAnoma = Window &
  typeof globalThis & {
    anoma: Anoma & {
      getSigner: (chainId: string) => Signer;
    };
  };
