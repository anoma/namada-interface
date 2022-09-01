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

export type ChainConfig = {
  chainId: string;
  rpc: string;
};

export interface Anoma {
  enable(chainId: string): Promise<void>;
  getSigner(chainId: string): Signer;
  addChain(chainConfig: ChainConfig): Promise<boolean>;
  chains: string[];
  version: string;
}

export type WindowWithAnoma = Window &
  typeof globalThis & {
    anoma: Anoma;
  };
