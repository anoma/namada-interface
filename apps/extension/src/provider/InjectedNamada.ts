import {
  ClearDisposableSignerProps,
  GenDisposableSignerResponse,
  Namada as INamada,
  Signer as ISigner,
  NamadaKeychainAccount,
  PersistDisposableSignerProps,
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

  public async accounts(): Promise<NamadaKeychainAccount[]> {
    return await InjectedProxy.requestMethod<string, NamadaKeychainAccount[]>(
      "accounts"
    );
  }

  public async defaultAccount(): Promise<NamadaKeychainAccount> {
    return await InjectedProxy.requestMethod<string, NamadaKeychainAccount>(
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

  public async genDisposableKeypair(): Promise<
    GenDisposableSignerResponse | undefined
  > {
    return await InjectedProxy.requestMethod<
      void,
      GenDisposableSignerResponse | undefined
    >("genDisposableKeypair");
  }

  public async persistDisposableKeypair(
    props: PersistDisposableSignerProps
  ): Promise<void> {
    return await InjectedProxy.requestMethod<
      PersistDisposableSignerProps,
      void
    >("persistDisposableKeypair", props);
  }

  public async clearDisposableKeypair(
    props: ClearDisposableSignerProps
  ): Promise<void> {
    return await InjectedProxy.requestMethod<ClearDisposableSignerProps, void>(
      "clearDisposableKeypair",
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
