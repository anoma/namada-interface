import { type MetaMaskInpageProvider } from "@metamask/providers";
import MetaMaskSDK from "@metamask/sdk";

import { Account, Chain } from "@anoma/types";
import { Integration } from "types/Integration";

const METAMASK_NOT_FOUND = "Metamask extension not found!";
const MULTIPLE_WALLETS = "Multiple wallets installed!";
const CANT_FETCH_ACCOUNTS = "Can't fetch accounts!";

type MetamaskWindow = Window &
  typeof globalThis & {
    ethereum: MetaMaskInpageProvider;
  };

class Metamask implements Integration<Account, unknown> {
  private _ethereum: MetaMaskInpageProvider;
  constructor(public readonly chain: Chain) {
    const MMSDK = new MetaMaskSDK();
    const provider = MMSDK.getProvider();

    if (!provider || !provider?.isMetaMask) {
      throw new Error(METAMASK_NOT_FOUND);
    }
    this._ethereum = provider;
  }

  detect(): boolean {
    return this._ethereum?.isMetaMask;
  }

  async accounts(): Promise<Account[] | undefined> {
    await this.syncChainId();

    const addresses = await this._ethereum.request<string[]>({
      method: "eth_requestAccounts",
    });

    if (addresses && !Array.isArray(addresses)) {
      Promise.reject(CANT_FETCH_ACCOUNTS);
    }

    const accounts: Account[] = (addresses as string[]).map((address) => ({
      address,
      alias: address.substring(0, 4),
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
    await this._ethereum.request<null>({
      method: "wallet_switchEthereumChain",
      params: [{ chainId }],
    });
  }
}

export default Metamask;
