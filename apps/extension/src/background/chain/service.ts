import { chains } from "@namada/chains";
import { SdkService } from "background/sdk";
import { ExtensionBroadcaster } from "extension";
import { LocalStorage } from "storage";

export class ChainService {
  constructor(
    protected readonly sdkService: SdkService,
    protected readonly localStorage: LocalStorage,
    protected readonly broadcaster: ExtensionBroadcaster
  ) {}

  async getChain(): Promise<string> {
    return (await this.localStorage.getChainId()) || chains.namada.chainId;
  }

  async updateChain(chainId: string): Promise<void> {
    await this.localStorage.setChainId(chainId);
    await this.broadcaster.updateNetwork();
  }
}
