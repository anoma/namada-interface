import { Anoma as IAnoma, ChainConfig, Signer } from "@anoma/types";

export class Anoma implements IAnoma {
  private _chains: string[] = [];

  constructor(private readonly _version: string) {}

  public async enable(chainId: string): Promise<void> {
    console.log({ chainId });
  }

  public getSigner(chainId: string): Signer {
    console.log({ chainId });
    return {} as Signer;
  }

  public async addChain(config: ChainConfig): Promise<boolean> {
    const { chainId } = config;
    if (this._chains.indexOf(chainId) < 0) {
      this._chains.push(chainId);
    }
    return true;
  }

  public get chains(): string[] {
    return this._chains;
  }

  public get version(): string {
    return this._version;
  }
}
