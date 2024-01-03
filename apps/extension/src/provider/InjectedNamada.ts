import {
  DerivedAccount,
  Namada as INamada,
  Signer as ISigner,
  TxMsgProps,
} from "@namada/types";
import { InjectedProxy } from "./InjectedProxy";
import { Signer } from "./Signer";

export class InjectedNamada implements INamada {
  constructor(private readonly _version: string) {}

  public async connect(chainId: string): Promise<void> {
    return await InjectedProxy.requestMethod<string, void>("connect", chainId);
  }

  public async accounts(): Promise<DerivedAccount[]> {
    return await InjectedProxy.requestMethod<string, DerivedAccount[]>(
      "accounts"
    );
  }

  public async defaultAccount(): Promise<DerivedAccount> {
    return await InjectedProxy.requestMethod<string, DerivedAccount>(
      "defaultAccount"
    );
  }

  public async balances(
    owner: string
  ): Promise<{ token: string; amount: string }[]> {
    return await InjectedProxy.requestMethod<
      string,
      { token: string; amount: string }[]
    >("balances", owner);
  }

  public getSigner(): ISigner | undefined {
    return new Signer(this);
  }

  public async submitTx(props: TxMsgProps): Promise<void> {
    return await InjectedProxy.requestMethod<TxMsgProps, void>(
      "submitTx",
      props
    );
  }

  public version(): string {
    return this._version;
  }
}
