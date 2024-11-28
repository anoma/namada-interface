import { chains } from "@namada/chains";
import { Sdk, getSdk } from "@namada/sdk/web";
import sdkInit from "@namada/sdk/web-init";

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

  static async init(): Promise<SdkService> {
    // Use fake RPC, the extension does not actually issue RPC requests:
    const rpc = chains.namada.rpc;
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
