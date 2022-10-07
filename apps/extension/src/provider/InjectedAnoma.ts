import {
  Anoma as IAnoma,
  Chain,
  SignedTx,
  Signer as ISigner,
  TxProps,
} from "@anoma/types";
import { DerivedAccount } from "types";
import { InjectedProxy } from "./InjectedProxy";
import { Signer } from "./Signer";

export class InjectedAnoma implements IAnoma {
  constructor(private readonly _version: string) {}

  public async connect(chainId: string): Promise<void> {
    return await InjectedProxy.requestMethod<string, void>("connect", chainId);
  }

  public async chain(chainId: string): Promise<Chain | undefined> {
    return InjectedProxy.requestMethod<string, Chain>("chain", chainId);
  }

  public async chains(): Promise<Chain[]> {
    return await InjectedProxy.requestMethod<void, Chain[]>(
      "chains",
      undefined
    );
  }

  public async suggestChain(chain: Chain): Promise<void> {
    await InjectedProxy.requestMethod<Chain, void>("suggestChain", chain);
  }

  public async accounts(chainId: string): Promise<DerivedAccount[]> {
    return await InjectedProxy.requestMethod<string, DerivedAccount[]>(
      "accounts",
      chainId
    );
  }

  public getSigner(chainId: string): ISigner<DerivedAccount> | undefined {
    return new Signer(chainId, this);
  }

  /*
  public async signTx(props: {
    signer: string,
    chainId: string,
    txArgs: TxProps
  }): Promise<SignedTx> {
    return await InjectedProxy.requestMethod<TxProps, SignedTx>(
      "signTx",
      props,
    );
  }
  */

  public version(): string {
    return this._version;
  }
}
