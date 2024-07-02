import {
  Chain,
  DerivedAccount,
  Namada as INamada,
  Signer as ISigner,
  SignArbitraryProps,
  SignArbitraryResponse,
  SignProps,
  VerifyArbitraryProps,
  WasmHash,
  WasmHashProps,
} from "@namada/types";
import { InjectedProxy } from "./InjectedProxy";
import { Signer } from "./Signer";

export class InjectedNamada implements INamada {
  constructor(private readonly _version: string) {}

  public async connect(): Promise<void> {
    return await InjectedProxy.requestMethod<string, void>("connect");
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

  public async sign(props: SignProps): Promise<Uint8Array> {
    return await InjectedProxy.requestMethod<SignProps, Uint8Array>(
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

  public async addTxWasmHashes(props: WasmHashProps): Promise<void> {
    return await InjectedProxy.requestMethod<WasmHashProps, void>(
      "addTxWasmHashes",
      props
    );
  }

  public async getTxWasmHashes(
    chainId: string
  ): Promise<WasmHash[] | undefined> {
    return await InjectedProxy.requestMethod<string, WasmHash[] | undefined>(
      "getTxWasmHashes",
      chainId
    );
  }

  public getSigner(): ISigner | undefined {
    return new Signer(this);
  }

  public version(): string {
    return this._version;
  }
}
