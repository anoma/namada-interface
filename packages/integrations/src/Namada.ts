import {
  Account,
  Chain,
  Namada as INamada,
  Signer,
  WindowWithNamada,
} from "@namada/types";

import { Integration } from "./types/Integration";

export default class Namada implements Integration<Account, Signer> {
  private _namada: WindowWithNamada["namada"] | undefined;

  constructor(public readonly chain: Chain) {}

  public get instance(): INamada | undefined {
    return this._namada;
  }

  private _init(): void {
    if (!this._namada) {
      this._namada = (<WindowWithNamada>window)?.namada;
    }
  }

  public detect(): boolean {
    this._init();
    return !!this._namada;
  }

  public async connect(): Promise<void> {
    await this._namada?.connect();
  }

  public async isConnected(): Promise<boolean | undefined> {
    return await this._namada?.isConnected();
  }

  public async getChain(): Promise<Chain | undefined> {
    return await this._namada?.getChain();
  }

  public async accounts(
    chainId?: string
  ): Promise<readonly Account[] | undefined> {
    const signer = this._namada?.getSigner();
    return await signer?.accounts(chainId);
  }

  public async defaultAccount(chainId?: string): Promise<Account | undefined> {
    const signer = this._namada?.getSigner();
    return await signer?.defaultAccount(chainId);
  }

  public signer(): Signer | undefined {
    return this._namada?.getSigner();
  }
}
