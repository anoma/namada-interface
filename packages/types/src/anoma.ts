import { SignedTx } from "./tx";
import { DerivedAccount } from "./account";
import { Chain } from "./chain";
import { Signer } from "./signer";

export interface Anoma {
  connect(chainId: string): Promise<void>;
  accounts(chainId: string): Promise<DerivedAccount[] | undefined>;
  getSigner(chainId: string): Signer;
  suggestChain(chainConfig: Chain): Promise<void>;
  signTx(props: {
    signer: string;
    txMsg: string;
    txData: string;
  }): Promise<SignedTx | undefined>;
  chain: (chainId: string) => Promise<Chain | undefined>;
  chains: () => Promise<Chain[] | undefined>;
  encodeTransfer: (txMsg: string) => Promise<string | undefined>;
  encodeIbcTransfer: (txMsg: string) => Promise<string | undefined>;
  encodeInitAccount: (props: {
    txMsg: string;
    address: string;
  }) => Promise<string | undefined>;
  version: () => string;
}

export type WindowWithAnoma = Window &
  typeof globalThis & {
    anoma: Anoma;
  };
