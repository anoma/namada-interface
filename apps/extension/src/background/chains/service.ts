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
  ) {
    //TODO: maybe we should call init after constructor
    void this._initChain();
  }

  private async _queryNativeToken(chain: Chain): Promise<Chain> {
    try {
      const nativeToken = await this.sdkService.getSdk().rpc.queryNativeToken();

      if (nativeToken) {
        chain.currency.address = nativeToken;
      }
    } catch (e) {
      console.warn(`Chain is unreachable: ${e}`);
    }

    await this.localStorage.setChain(chain);
    return chain;
  }

  private async _initChain(): Promise<void> {
    // Initialize default chain in storage
    const chain: Chain = (await this.localStorage.getChain()) || chains.namada;
    // Default chain config does not have a token address, so we query:
    if (!chain.currency.address) {
      await this._queryNativeToken(chain);
    }
  }

  async getChain(): Promise<Chain> {
    let chain: Chain = (await this.localStorage.getChain()) || chains.namada;
    // If a previous query for native token failed, attempt again:
    if (!chain.currency.address) {
      chain = await this._queryNativeToken(chain);
    }
    return chain;
  }

  async updateChain(chainId: string, url: string): Promise<void> {
    let chain = await this.getChain();
    if (!chain) {
      throw new Error("No chain found!");
    }
    // Update RPC & Chain ID, then query for native token
    chain = {
      ...chain,
      chainId,
      rpc: url,
    };
    await this.localStorage.setChain(await this._queryNativeToken(chain));
    await this.broadcaster.updateNetwork();
  }
}
