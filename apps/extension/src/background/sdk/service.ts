import { Query, Sdk } from "@namada/shared";
import { ChainsService } from "background/chains";

const {
  NAMADA_INTERFACE_NAMADA_TOKEN:
  tokenAddress = "tnam1qxgfw7myv4dh0qna4hq0xdg6lx77fzl7dcem8h7e",
} = process.env;

export class SdkService {
  constructor(protected readonly chainsService: ChainsService) { }

  public async getRpc(): Promise<string> {
    // Pull chain config from store, as the RPC value may have changed:
    const chain = await this.chainsService.getChain();

    if (!chain) {
      throw new Error("No chain found!");
    }
    const { rpc } = chain;
    return rpc;
  }

  async getSdk(): Promise<Sdk> {
    const rpc = await this.getRpc();
    const chain = await this.chainsService.getChain();

    return new Sdk(rpc, chain.currency.address || tokenAddress);
  }

  async getQuery(): Promise<Query> {
    const rpc = await this.getRpc();
    return new Query(rpc);
  }
}
