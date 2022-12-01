import {
  Account,
  Anoma as IAnoma,
  Chain,
  Signer,
  WindowWithAnoma,
} from "@anoma/types";

export default class Anoma {
  constructor(
    public readonly chain: Chain,
    private readonly _anoma = (<WindowWithAnoma>window)?.anoma
  ) {}

  public get instance(): IAnoma | undefined {
    return this._anoma;
  }

  public detect(): boolean {
    return !!this._anoma;
  }

  public async connect(): Promise<void> {
    await this._anoma.connect(this.chain.chainId);
  }

  public async fetchAccounts(): Promise<Account[] | undefined> {
    const signer = this._anoma.getSigner("");
    return await signer.accounts();
  }

  public signer(chainId: string): Signer {
    return this._anoma.getSigner(chainId);
  }
}
