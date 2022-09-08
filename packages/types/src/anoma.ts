import { ChainInfo as Chain } from "@keplr-wallet/types";

export type Transaction = {
  hash: Uint8Array;
  tx: Uint8Array;
};

export type Account = {
  alias: string;
  address: string;
  publicKey: Uint8Array;
};

export interface Signer {
  sign(account: Account, tx: Transaction): Promise<Transaction>;
  accounts: Account[];
}

export interface Anoma {
  connect(chainId: string): Promise<void>;
  getSigner(chainId: string): Signer;
  suggestChain(chainConfig: Chain): Promise<boolean>;
  chains: () => Chain[];
  version: () => string;
}

export type WindowWithAnoma = Window &
  typeof globalThis & {
    anoma: Anoma;
  };
