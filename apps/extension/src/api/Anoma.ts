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

export interface IAnoma {
  enable(chainId: string): Promise<void>;
  getSigner(chainId: string): Signer;
  addChain(chainConfig: ChainConfig): Promise<boolean>;
  chains: string[];
}

export class Anoma implements IAnoma {
  private _chains: string[] = [];

  public async enable(chainId: string): Promise<void> {
    console.log({ chainId });
  }

  public getSigner(chainId: string): Signer {
    console.log({ chainId });
    return {} as Signer;
  }

  public async addChain(config: ChainConfig): Promise<boolean> {
    console.log({ config });
    const { chainId } = config;
    if (this._chains.indexOf(chainId) < 0) {
      this._chains.push(chainId);
    }
    return true;
  }

  public get chains() {
    return this._chains;
  }
}
