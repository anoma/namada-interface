import {
  Account,
  AccountType,
  Chain,
  Namada as INamada,
  Signer,
  TokenBalances,
  WindowWithNamada,
} from "@namada/types";
import { mapUndefined } from "@namada/utils";
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

  public async connect(chainId?: string): Promise<void> {
    await this._namada?.connect(chainId);
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

  public async submitBridgeTransfer(
    props: BridgeProps,
    type: AccountType
  ): Promise<void> {
    const signer = this._namada?.getSigner();
    if (props.ibcProps) {
      return await signer?.submitIbcTransfer(
        props.ibcProps,
        props.txProps,
        type
      );
    } else if (props.bridgeProps) {
      return await signer?.submitEthBridgeTransfer(
        props.bridgeProps,
        props.txProps,
        type
      );
    }

    return Promise.reject("Invalid bridge transfer props!");
  }

  public async queryBalances(
    owner: string,
    tokens: string[] = []
  ): Promise<TokenBalances> {
    const balances = (await this._namada?.balances({ owner, tokens })) || [];
    console.log(balances);

    // TODO: fix this
    return {
      NAM: mapUndefined(
        (amount) => new BigNumber(amount),
        balances[0]?.amount || "0"
      ),
    };
  }

  public async sync(): Promise<void> {
    await this._namada?.shieldedSync();
  }
}
