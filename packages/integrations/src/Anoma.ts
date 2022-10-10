import { ChainInfo as Chain } from "@keplr-wallet/types";
import { Anoma as IAnoma, WindowWithAnoma } from "@anoma/types";

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
}
