import { DerivedAccount } from "./account";
import { Chain } from "./chain";
import { Signer } from "./signer";

export interface Namada {
  connect(chainId: string): Promise<void>;
  accounts(chainId: string): Promise<DerivedAccount[] | undefined>;
  balances(
    owner: string
  ): Promise<{ token: string; amount: string }[] | undefined>;
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

export type WindowWithNamada = Window &
  typeof globalThis & {
    namada: Namada & {
      getSigner: (chainId: string) => Signer;
    };
  };
