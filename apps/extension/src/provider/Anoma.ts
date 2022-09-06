import { Anoma as IAnoma, ChainConfig, Signer } from "@anoma/types";
import { AddChainMsg, Ports, MessageRequester } from "../router/types";

export class Anoma implements IAnoma {
  constructor(
    private readonly _version: string,
    protected readonly requester?: MessageRequester
  ) {}

  public async connect(chainId: string): Promise<void> {
    console.log("Anoma::enable()", { chainId });
  }

  public getSigner(chainId: string): Signer {
    console.log({ chainId });
    console.log("Anoma::getSigner()", { chainId });
    return {} as Signer;
  }

  public async addChain(config: ChainConfig): Promise<boolean> {
    console.log("Anoma::addChain()", config);
    await this.requester?.sendMessage(
      Ports.Background,
      new AddChainMsg(config)
    );
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
