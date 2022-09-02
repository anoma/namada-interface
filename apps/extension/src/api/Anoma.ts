import { Anoma as IAnoma, ChainConfig, Signer } from "@anoma/types";
import { ExtensionMessageRequester } from "../router";
import { AddChainMsg, Ports } from "../types";

export class Anoma implements IAnoma {
  constructor(
    private readonly _version: string,
    protected readonly requester: ExtensionMessageRequester
  ) {}

  public async enable(chainId: string): Promise<void> {
    console.log("Anoma::enable()", { chainId });
  }

  public getSigner(chainId: string): Signer {
    console.log({ chainId });
    console.log("Anoma::getSigner()", { chainId });
    return {} as Signer;
  }

  public async addChain(config: ChainConfig): Promise<boolean> {
    console.log("Anoma::addChain()", config);
    await this.requester.sendMessage(Ports.Background, new AddChainMsg(config));
    return true;
  }

  public get chains(): ChainConfig[] {
    // TODO: Return from background state
    return [];
  }

  public get version(): string {
    return this._version;
  }
}
