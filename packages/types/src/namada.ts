import { AccountType, DerivedAccount } from "./account";
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
  submitBond: (props: {
    txMsg: string;
    type: AccountType;
    publicKey?: string;
  }) => Promise<void>;
  submitUnbond: (txMsg: string) => Promise<void>;
  submitWithdraw: (txMsg: string) => Promise<void>;
  submitTransfer: (props: {
    txMsg: string;
    type: AccountType;
  }) => Promise<void>;
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
