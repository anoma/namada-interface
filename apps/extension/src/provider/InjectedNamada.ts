import {
  Chain,
  DerivedAccount,
  Namada as INamada,
  Signer as ISigner,
  SignArbitraryProps,
  SignArbitraryResponse,
  SignProps,
  VerifyArbitraryProps,
} from "@namada/types";
import { InjectedProxy } from "./InjectedProxy";
import { Signer } from "./Signer";

export class InjectedNamada implements INamada {
  constructor(private readonly _version: string) {}

  public async connect(chainId?: string): Promise<void> {
    return await InjectedProxy.requestMethod<string, void>("connect", chainId);
  }

  public async disconnect(): Promise<void> {
    return await InjectedProxy.requestMethod<string, void>("disconnect");
  }

  public async isConnected(): Promise<boolean> {
    return await InjectedProxy.requestMethod<string, boolean>("isConnected");
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

  public async updateDefaultAccount(address: string): Promise<void> {
    return await InjectedProxy.requestMethod<string, void>(
      "updateDefaultAccount",
      address
    );
  }

  public async sign(props: SignProps): Promise<Uint8Array[]> {
    return await InjectedProxy.requestMethod<SignProps, Uint8Array[]>(
      "sign",
      props
    );
  }

  public async signArbitrary(
    props: SignArbitraryProps
  ): Promise<SignArbitraryResponse | undefined> {
    return await InjectedProxy.requestMethod<
      SignArbitraryProps,
      SignArbitraryResponse | undefined
    >("signArbitrary", props);
  }

  public async verify(props: VerifyArbitraryProps): Promise<void> {
    return await InjectedProxy.requestMethod<VerifyArbitraryProps, void>(
      "verify",
      props
    );
  }

  public async getChain(): Promise<Chain | undefined> {
    return await InjectedProxy.requestMethod<void, Chain>("getChain");
  }

  public getSigner(): ISigner | undefined {
    return new Signer(this);
  }

  public version(): string {
    return this._version;
  }
}
