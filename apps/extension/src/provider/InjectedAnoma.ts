import { Anoma as IAnoma, Chain, Signer } from "@anoma/types";
import { InjectedProxy } from "./InjectedProxy";

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

  public async getSigner(chainId: string): Promise<Signer> {
    return await InjectedProxy.requestMethod<string, Signer>(
      "getSigner",
      chainId
    );
  }

  public version(): string {
    return this._version;
  }
}
