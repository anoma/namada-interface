import { Anoma as IAnoma, ChainConfig, Signer } from "@anoma/types";
import { ExtensionMessageRequester } from "../router";

export class Anoma implements IAnoma {
  private _chains: ChainConfig[] = [];

  constructor(
    private readonly _version: string,
    private readonly _router: ExtensionMessageRequester
  ) {}

  public async enable(chainId: string): Promise<void> {
    console.log({ chainId });
  }

  public getSigner(chainId: string): Signer {
    console.log({ chainId });
    return {} as Signer;
  }

  public async addChain(config: ChainConfig): Promise<boolean> {
    const { chainId } = config;
    if (!this._chains.find((config) => config.chainId === chainId)) {
      this._chains.push(config);
    }
    return true;
  }

  public get chains(): ChainConfig[] {
    return this._chains;
  }

  public get version(): string {
    return this._version;
  }
}
