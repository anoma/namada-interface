import { ChainInfo as Chain } from "@keplr-wallet/types";
import { Anoma as IAnoma, Signer } from "@anoma/types";
import { Ports, MessageRequester } from "../router";
import { SuggestChainMsg } from "../background/chains";

export class Anoma implements IAnoma {
  constructor(
    private readonly _version: string,
    protected readonly requester?: MessageRequester
  ) {}

  public async connect(chainId: string): Promise<void> {}

  public getSigner(chainId: string): Signer {
    return {} as Signer;
  }

  public async suggestChain(config: Chain): Promise<boolean> {
    const results = await this.requester?.sendMessage(
      Ports.Background,
      new SuggestChainMsg(config)
    );
    return true;
  }

  public chains(): Chain[] {
    // TODO: Return from background state
    return [];
  }

  public version(): string {
    return this._version;
  }
}
