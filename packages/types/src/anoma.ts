import { SignedTx } from "./tx";
import { DerivedAccount } from "./account";
import { Chain } from "./chain";
import { Signer } from "./signer";

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
  encodeBonding: (txMsg: string) => Promise<string | undefined>;
  submitBond: (props: { txMsg1: string; txMsg2: string }) => Promise<void>;
  encodeTransfer: (txMsg: string) => Promise<string | undefined>;
  encodeIbcTransfer: (txMsg: string) => Promise<string | undefined>;
  encodeInitAccount: (props: {
    txMsg: string;
    address: string;
  }) => Promise<string | undefined>;
  encodeRevealPk: (props: { signer: string }) => Promise<string | undefined>;
  version: () => string;
}

export type WindowWithAnoma = Window &
  typeof globalThis & {
    anoma: Anoma & {
      getSigner: (chainId: string) => Signer;
    };
  };
