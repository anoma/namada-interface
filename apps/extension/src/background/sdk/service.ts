import { Sdk, getSdk } from "@namada/sdk/web";
import sdkInit from "@namada/sdk/web-init";

const {
  NAMADA_INTERFACE_NAMADA_TOKEN:
    defaultTokenAddress = "tnam1qxgfw7myv4dh0qna4hq0xdg6lx77fzl7dcem8h7e",
} = process.env;

// Extension does not care about the MASP indexer - this will map to None in Rust
const MASP_INDEXER_URL = "";
// Extension does not use RPC URL
const RPC_URL = "";

export class SdkService {
  private constructor(
    private readonly token: string,
    private readonly cryptoMemory: WebAssembly.Memory
  ) {}

  static async init(): Promise<SdkService> {
    const { cryptoMemory } = await sdkInit();
    return new SdkService(defaultTokenAddress, cryptoMemory);
  }

  getSdk(): Sdk {
    return getSdk(
      this.cryptoMemory,
      RPC_URL,
      MASP_INDEXER_URL,
      "NOT USED DB NAME",
      this.token
    );
  }
}
