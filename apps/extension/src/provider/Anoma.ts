import { ChainInfo as Chain } from "@keplr-wallet/types";
import { Anoma as IAnoma, Signer } from "@anoma/types";
import { Ports, MessageRequester } from "../router";
import { GetChainsMsg, SuggestChainMsg } from "../background/chains";

export class Anoma implements IAnoma {
  constructor(
    private readonly _version: string,
    protected readonly requester?: MessageRequester
  ) {}

  public async connect(chainId: string): Promise<void> {
    console.info("connect", chainId);
  }

  public getSigner(chainId: string): Signer {
    console.info("getSigner", chainId);
    return {} as Signer;
  }

  public async suggestChain(chain: Chain): Promise<string> {
    const { chainId } = chain;
    const results = await this.requester?.sendMessage(
      Ports.Background,
      new SuggestChainMsg(chain)
    );
    console.info("suggestChain", { results });
    return chainId;
  }

  public chains(): Chain[] {
    // TODO: Return from background state
    const results = this.requester?.sendMessage(
      Ports.Background,
      new GetChainsMsg()
    );
    console.info("chains()", { results });
    return [];
  }

  public version(): string {
    return this._version;
  }
}
