import { ChainInfo as Chain } from "@keplr-wallet/types";
import { Anoma as IAnoma, Signer } from "@anoma/types";
import { Ports, MessageRequester } from "../router";
import {
  GetChainMsg,
  GetChainsMsg,
  GetSignerMsg,
  SuggestChainMsg,
} from "../background/chains";

export class Anoma implements IAnoma {
  constructor(
    private readonly _version: string,
    protected readonly requester?: MessageRequester
  ) {}

  public async connect(chainId: string): Promise<void> {
    console.info("connect", chainId);
  }

  public async getSigner(chainId: string): Promise<Signer | undefined> {
    console.info("getSigner", chainId);
    return await this.requester?.sendMessage(
      Ports.Background,
      new GetSignerMsg()
    );
  }

  public async suggestChain(chain: Chain): Promise<void> {
    return await this.requester?.sendMessage(
      Ports.Background,
      new SuggestChainMsg(chain)
    );
  }

  public async chain(chainId: string): Promise<Chain | undefined> {
    return await this.requester?.sendMessage(
      Ports.Background,
      new GetChainMsg(chainId)
    );
  }

  public async chains(): Promise<Chain[] | undefined> {
    return await this.requester?.sendMessage(
      Ports.Background,
      new GetChainsMsg()
    );
  }

  public version(): string {
    return this._version;
  }
}
