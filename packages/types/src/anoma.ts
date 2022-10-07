import { SignedTx } from "./tx";
import { DerivedAccount } from "./account";
import { Chain } from "./chain";

export interface Anoma {
  connect(chainId: string): Promise<void>;
  accounts(chainId: string): Promise<DerivedAccount[] | undefined>;
  suggestChain(chainConfig: Chain): Promise<void>;
  signTx(props: {
    signer: string;
    txMsg: string;
    txData: string;
  }): Promise<SignedTx | undefined>;
  chain: (chainId: string) => Promise<Chain | undefined>;
  chains: () => Promise<Chain[] | undefined>;
  encodeTransfer: (txMsg: string) => Promise<string | undefined>;
  encodeIbcTransfer: (txMsg: Uint8Array) => Promise<Uint8Array | undefined>;
  encodeInitAccount: (txMsg: Uint8Array) => Promise<Uint8Array | undefined>;
  version: () => string;
}

export type WindowWithAnoma = Window &
  typeof globalThis & {
    anoma: Anoma;
  };
