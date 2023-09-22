import {
  Account,
  Namada as INamada,
  Chain,
  Signer,
  Tokens,
  TokenType,
  TokenBalance,
  WindowWithNamada,
  AccountType,
} from "@namada/types";
import BigNumber from "bignumber.js";

import { BridgeProps, Integration } from "./types/Integration";

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
    this._init();
    await this._namada?.connect(this.chain.chainId);
  }

  public async accounts(): Promise<readonly Account[] | undefined> {
    await this.connect();
    const signer = this._namada?.getSigner(this.chain.chainId);
    return await signer?.accounts();
  }

  public signer(): Signer | undefined {
    return this._namada?.getSigner(this.chain.chainId);
  }

  public async submitBridgeTransfer(
    props: BridgeProps,
    type: AccountType
  ): Promise<void> {
    const signer = this._namada?.getSigner(this.chain.chainId);
    if (props.ibcProps) {
      return await signer?.submitIbcTransfer(props.ibcProps, type);
    } else if (props.bridgeProps) {
      return await signer?.submitEthBridgeTransfer(props.bridgeProps, type);
    }

    return Promise.reject("Invalid bridge transfer props!");
  }

  public async queryBalances(owner: string): Promise<TokenBalance[]> {
    return (await this._namada?.balances(owner)) || [];
  }
}
