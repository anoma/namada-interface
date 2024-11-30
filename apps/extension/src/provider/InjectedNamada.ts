import {
  Account,
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
  constructor(private readonly _version: string) { }

  public async connect(chainId?: string): Promise<void> {
    return await InjectedProxy.requestMethod<string, void>("connect", chainId);
  }

  public async disconnect(chainId?: string): Promise<void> {
    return await InjectedProxy.requestMethod<string, void>(
      "disconnect",
      chainId
    );
  }

  public async isConnected(chainId?: string): Promise<boolean> {
    return await InjectedProxy.requestMethod<string, boolean>(
      "isConnected",
      chainId
    );
  }

  public async accounts(): Promise<Account[]> {
    return await InjectedProxy.requestMethod<string, Account[]>("accounts");
  }

  public async defaultAccount(): Promise<Account> {
    return await InjectedProxy.requestMethod<string, Account>("defaultAccount");
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

  public getSigner(): ISigner | undefined {
    return new Signer(this);
  }

  public version(): string {
    return this._version;
  }
}
