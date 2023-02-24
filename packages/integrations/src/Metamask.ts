import { type MetaMaskInpageProvider } from "@metamask/providers";
import MetaMaskSDK from "@metamask/sdk";

import { Account, BridgeTransferProps, Chain } from "@anoma/types";
import { shortenAddress } from "@anoma/utils";
import { Integration } from "./types/Integration";

const MULTIPLE_WALLETS = "Multiple wallets installed!";
const CANT_FETCH_ACCOUNTS = "Can't fetch accounts!";

type MetamaskWindow = Window &
  typeof globalThis & {
    ethereum: MetaMaskInpageProvider;
  };

class Metamask implements Integration<Account, unknown, BridgeTransferProps> {
  private _ethereum: MetaMaskInpageProvider | undefined;
  constructor(public readonly chain: Chain) {}

  private init(): void {
    if ((<MetamaskWindow>window).ethereum) {
      const MMSDK = new MetaMaskSDK();
      const provider = MMSDK.getProvider();

      this._ethereum = provider;
    }
  }

  detect(): boolean {
    this.init();
    const ethereum = (<MetamaskWindow>window).ethereum;

    return ethereum?.isMetaMask ?? false;
  }

  async accounts(): Promise<Account[] | undefined> {
    await this.syncChainId();

    const addresses = await this._ethereum?.request<string[]>({
      method: "eth_requestAccounts",
    });

    if (addresses && !Array.isArray(addresses)) {
      Promise.reject(CANT_FETCH_ACCOUNTS);
    }

    const accounts: Account[] = (addresses as string[]).map((address) => ({
      address,
      alias: shortenAddress(address, 16),
      chainId: this.chain.chainId,
      isShielded: false,
    }));

    return accounts;
  }

  signer(): unknown {
    return {};
  }

  async connect(): Promise<void> {
    if ((window as MetamaskWindow).ethereum === this._ethereum) {
      await this.syncChainId();
    } else {
      Promise.reject(MULTIPLE_WALLETS);
    }
  }

  private async syncChainId(): Promise<void> {
    const { chainId } = this.chain;
    await this._ethereum?.request<null>({
      method: "wallet_switchEthereumChain",
      params: [{ chainId }],
    });
  }

  public async submitBridgeTransfer({
    source,
    target,
    amount,
  }: BridgeTransferProps): Promise<void> {
    // TODO: Submit transfer via Ethereum Bridge
    console.log("Metamask.submitBridgeTransfer", {
      source,
      target,
      amount,
    });
    return;
  }

  public async queryBalance(address: string): Promise<number> {
    // TODO: Query balance from Ethereum
    console.log("Metamask.queryBalance", { address });
    return 0;
  }
}

export default Metamask;
