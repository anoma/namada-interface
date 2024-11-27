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

  public async disconnect(): Promise<void> {
    await this._namada?.disconnect();
  }

  public async isConnected(): Promise<boolean | undefined> {
    return await this._namada?.isConnected();
  }

  public async accounts(): Promise<readonly Account[] | undefined> {
    return await this._namada?.accounts();
  }

  public async defaultAccount(): Promise<Account | undefined> {
    return await this._namada?.defaultAccount();
  }

  public async updateDefaultAccount(address: string): Promise<void> {
    return await this._namada?.updateDefaultAccount(address);
  }

  public signer(): Signer | undefined {
    return this._namada?.getSigner();
  }
}
