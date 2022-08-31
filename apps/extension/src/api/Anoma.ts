type Transaction = {
  hash: Uint8Array;
  tx: Uint8Array;
};

type Account = {
  alias: string;
  address: string;
  publicKey: Uint8Array;
};

interface Signer {
  sign(account: Account, tx: Transaction): Promise<Transaction>;
  accounts: Account[];
}

type ChainConfig = {
  chainId: string;
  rpc: string;
};

interface IAnoma {
  enable(chainId: string): Promise<void>;
  getSigner(chainId: string): Signer;
  addChain(chainConfig: ChainConfig): Promise<boolean>;
  chains: string[];
}

class Anoma implements IAnoma {
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
    return true;
  }

  public get chains() {
    return this._chains;
  }
}

export default Anoma;
