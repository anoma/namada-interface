import {
  Account,
  Anoma as IAnoma,
  Chain,
  Signer,
  WindowWithAnoma,
} from "@anoma/types";

import { Integration } from "types/Integration";

export default class Anoma implements Integration<Account, Signer> {
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

  public async accounts(): Promise<readonly Account[] | undefined> {
    const signer = this._anoma.getSigner(this.chain.chainId);
    return await signer.accounts();
  }

  public signer(): Signer | undefined {
    return this._anoma.getSigner(this.chain.chainId);
  }
}
