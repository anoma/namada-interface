import { chains } from "@namada/chains";
import { Chain } from "@namada/types";
import { SdkService } from "background/sdk";
import { ExtensionBroadcaster } from "extension";
import { LocalStorage } from "storage";

export const CHAINS_KEY = "chains";

export class ChainsService {
  constructor(
    protected readonly sdkService: SdkService,
    protected readonly localStorage: LocalStorage,
    protected readonly broadcaster: ExtensionBroadcaster
  ) {}

  async getChain(): Promise<Chain> {
    return (await this.localStorage.getChain()) || chains.namada;
  }

  async updateChain(chainId: string): Promise<void> {
    let chain = await this.getChain();
    if (!chain) {
      throw new Error("No chain found!");
    }
    // Update chain ID
    chain = {
      ...chain,
      chainId,
    };

    await this.localStorage.setChain(chain);
    await this.broadcaster.updateNetwork();
  }
}
