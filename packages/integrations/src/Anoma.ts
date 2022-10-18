import { ChainInfo as Chain } from "@keplr-wallet/types";
import { Account, Anoma as IAnoma, WindowWithAnoma } from "@anoma/types";

export class Anoma {
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
    await this._anoma.connect("");
  }

  public async fetchAccounts(): Promise<Account[] | undefined> {
    const signer = this._anoma.getSigner("");
    return await signer.accounts();
  }
}
