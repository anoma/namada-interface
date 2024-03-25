import { chains } from "@namada/chains";
import { Rpc, Sdk, getSdk } from "@namada/sdk/web";
import sdkInit from "@namada/sdk/web-init";
import { LocalStorage } from "storage";

const {
  NAMADA_INTERFACE_NAMADA_TOKEN:
    tokenAddress = "tnam1qxgfw7myv4dh0qna4hq0xdg6lx77fzl7dcem8h7e",
} = process.env;

//TODO: Maybe we can remove this and replace SdkService calls with Sdk calls?
export class SdkService {
  private constructor(private readonly sdk: Sdk) {}

  static async init(localStorage: LocalStorage): Promise<SdkService> {
    const chain = await localStorage.getChain();
    const rpc = chain?.rpc || chains.namada.rpc;
    const token = chain?.currency.address || tokenAddress;
    const { cryptoMemory } = await sdkInit();
    const sdk = await getSdk(
      cryptoMemory,
      rpc,
      "TODO: not used db name",
      token
    );

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
