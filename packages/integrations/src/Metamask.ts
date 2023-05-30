import { type MetaMaskInpageProvider } from "@metamask/providers";
import MetaMaskSDK from "@metamask/sdk";

import { Account, AccountType, Chain, TokenBalance } from "@anoma/types";
import { shortenAddress } from "@anoma/utils";
import { BridgeProps, Integration } from "./types/Integration";

const MULTIPLE_WALLETS = "Multiple wallets installed!";
const CANT_FETCH_ACCOUNTS = "Can't fetch accounts!";

type MetamaskWindow = Window &
  typeof globalThis & {
    ethereum: MetaMaskInpageProvider;
  };

class Metamask implements Integration<Account, unknown> {
  private _ethereum: MetaMaskInpageProvider | undefined;
  constructor(public readonly chain: Chain) { }

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
      type: AccountType.PrivateKey,
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

  public async submitBridgeTransfer(props: BridgeProps): Promise<void> {
    const { source, target, amount } = props.bridgeProps || {};
    // TODO: Submit transfer via Ethereum Bridge
    console.log("Metamask.submitBridgeTransfer", {
      source,
      target,
      amount,
    });
    return;
  }

  public async queryBalances(owner: string): Promise<TokenBalance[]> {
    console.log("Metamask.queryBalance", owner);
    return [];
  }
}

export default Metamask;
