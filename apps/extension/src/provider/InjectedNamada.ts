import {
  BalancesProps,
  Chain,
  DerivedAccount,
  Namada as INamada,
  Signer as ISigner,
  SignArbitraryProps,
  SignatureResponse,
  TxMsgProps,
  VerifyArbitraryProps,
} from "@namada/types";
import { InjectedProxy } from "./InjectedProxy";
import { Signer } from "./Signer";

export class InjectedNamada implements INamada {
  constructor(private readonly _version: string) { }

  public async connect(): Promise<void> {
    return await InjectedProxy.requestMethod<string, void>("connect");
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

  public async sign(
    props: SignArbitraryProps
  ): Promise<SignatureResponse | undefined> {
    return await InjectedProxy.requestMethod<
      SignArbitraryProps,
      SignatureResponse | undefined
    >("sign", props);
  }

  public async verify(props: VerifyArbitraryProps): Promise<void> {
    return await InjectedProxy.requestMethod<VerifyArbitraryProps, void>(
      "verify",
      props
    );
  }

  public async balances(
    props: BalancesProps
  ): Promise<{ token: string; amount: string }[]> {
    return await InjectedProxy.requestMethod<
      BalancesProps,
      { token: string; amount: string }[]
    >("balances", props);
  }

  public async getChain(): Promise<Chain | undefined> {
    return await InjectedProxy.requestMethod<void, Chain>("getChain");
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
