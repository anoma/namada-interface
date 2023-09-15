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
    if (props.ibcProps) {
      const signer = this._namada?.getSigner(this.chain.chainId);
      return await signer?.submitIbcTransfer(props.ibcProps, type);
    } else if (props.bridgeProps) {
      console.log("TODO: Implement Ethereum Bridge transfer");
      return;
    }

    return Promise.reject("Invalid bridge transfer props!");
  }

  public async queryBalances(owner: string): Promise<TokenBalance[]> {
    const balance = (await this._namada?.balances(owner)) || [];
    const tokenBalances = Object.keys(Tokens).map((tokenType: string) => {
      const { address: tokenAddress = "" } = Tokens[tokenType as TokenType];
      const amount =
        balance.find(({ token }) => token === tokenAddress)?.amount ||
        new BigNumber(0);

      // TODO: Implement balance fetching via SDK
      return {
        token: tokenType as TokenType,
        // BigNumber is converted to string because BigNumber methods are lost
        // when a BigNumber is sent using postMessage.
        // See https://github.com/MikeMcl/bignumber.js/issues/245.
        amount: amount.toString(),
      };
    });

    return tokenBalances;
  }
}
