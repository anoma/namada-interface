import { chains } from "@namada/chains";
import { Sdk, getNativeToken, getSdk } from "@namada/sdk/web";
import sdkInit from "@namada/sdk/web-init";
import { Chain } from "@namada/types";
import { LocalStorage } from "storage";

const {
  NAMADA_INTERFACE_NAMADA_TOKEN:
    defaultTokenAddress = "tnam1qxgfw7myv4dh0qna4hq0xdg6lx77fzl7dcem8h7e",
} = process.env;

export class SdkService {
  private constructor(
    private rpc: string,
    private readonly token: string,
    private readonly cryptoMemory: WebAssembly.Memory
  ) {}

  static async init(localStorage: LocalStorage): Promise<SdkService> {
    // Get stored chain
    const chain = await localStorage.getChain();
    // If chain is not stored, use default chain information
    const rpc = chain?.rpc || chains.namada.rpc;

    const { cryptoMemory } = await sdkInit();

    let tokenAddress = chain?.currency.address;

    if (!tokenAddress) {
      try {
        tokenAddress = await getNativeToken(rpc);
      } catch (error) {
        console.warn(
          "Unable to query native token. Falling back to the default.",
          error
        );
        tokenAddress = defaultTokenAddress;
      }
    }

    return new SdkService(rpc, defaultTokenAddress, cryptoMemory);
  }

  /**
   * Sync the chain information after a network update
   *
   * @param {Chain} chain - Chain information
   */
  syncChain(chain: Chain): void {
    this.rpc = chain.rpc;
  }

  getSdk(): Sdk {
    return getSdk(this.cryptoMemory, this.rpc, "NOT USED DB NAME", this.token);
  }
}
