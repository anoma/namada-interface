import { Sdk, getSdk } from "@heliax/namada-sdk/web";
import sdkInit from "@heliax/namada-sdk/web-init";
import { chains } from "@namada/chains";
import { LocalStorage } from "storage";

const {
  NAMADA_INTERFACE_NAMADA_TOKEN:
    defaultTokenAddress = "tnam1qxgfw7myv4dh0qna4hq0xdg6lx77fzl7dcem8h7e",
} = process.env;

// Extension does not care about the MASP indexer - this will map to None in Rust
const MASP_INDEXER_URL = "";

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

    return new SdkService(rpc, defaultTokenAddress, cryptoMemory);
  }

  getSdk(): Sdk {
    return getSdk(
      this.cryptoMemory,
      this.rpc,
      MASP_INDEXER_URL,
      "NOT USED DB NAME",
      this.token
    );
  }
}
