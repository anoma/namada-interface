import { chains } from "@namada/chains";
import { Rpc, Sdk, initAsync } from "@namada/sdk/web";
import { LocalStorage } from "storage";

const {
  NAMADA_INTERFACE_NAMADA_TOKEN:
    tokenAddress = "tnam1qxgfw7myv4dh0qna4hq0xdg6lx77fzl7dcem8h7e",
} = process.env;

//TODO: Maybe we can remove this and replace SdkService calls with Sdk calls?
export class SdkService {
  private constructor(private readonly sdk: Sdk) {}

  static async init(localStorage: LocalStorage): Promise<SdkService> {
    const chain = (await localStorage.getChain()) || chains.namada;
    const token = chain.currency.address || tokenAddress;
    const sdk = await initAsync(chain.rpc, token);

    return new SdkService(sdk);
  }

  getSdk(): Sdk {
    return this.sdk;
  }

  //TODO: change name?
  getQuery(): Rpc {
    return this.sdk.rpc;
  }
}
