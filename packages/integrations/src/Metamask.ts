import { type MetaMaskInpageProvider } from "@metamask/providers";
import { ethers } from "ethers";

import {
  Account,
  AccountType,
  Chain,
  MetamaskEvents,
  TokenBalance,
} from "@namada/types";
import { shortenAddress } from "@namada/utils";
import { erc20Abi, ethereumBridgeAbi } from "./abi";
import { BridgeProps, Integration } from "./types/Integration";

const MULTIPLE_WALLETS = "Multiple wallets installed!";
const CANT_FETCH_ACCOUNTS = "Can't fetch accounts!";
const {
  NAMADA_INTERFACE_CONTRACT_ADDR_ETH_BRIDGE = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
} = process.env;

export type MetamaskWindow = Window &
  typeof globalThis & {
    ethereum: MetaMaskInpageProvider;
  };

declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider;
  }
}

class Metamask implements Integration<Account, unknown> {
  private _ethereum: MetaMaskInpageProvider | undefined;
  constructor(public readonly chain: Chain) { }

  private init(): void {
    const provider = window.ethereum;
    if (provider) {
      this._ethereum = provider;
    }
  }

  detect(): boolean {
    this.init();
    const ethereum = window.ethereum;

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
      chainKey: this.chain.id,
    }));

    return accounts;
  }

  signer(): unknown {
    return {};
  }

  async connect(): Promise<void> {
    if (window.ethereum === this._ethereum) {
      await this.syncChainId();
    } else {
      Promise.reject(MULTIPLE_WALLETS);
    }
  }

  public async getChain(): Promise<Chain> {
    return this.chain;
  }

  private async syncChainId(): Promise<void> {
    const { chainId } = this.chain;

    await this._ethereum?.request<null>({
      method: "wallet_switchEthereumChain",
      params: [{ chainId }],
    });
  }

  public async submitBridgeTransfer(props: BridgeProps): Promise<void> {
    if (!props.bridgeProps) {
      throw new Error("No bridge props");
    }

    const { sender, recipient, amount, asset } = props.bridgeProps;
    //TODO: check this shit
    const amountNumber = amount?.toNumber() || 0;
    const provider = new ethers.BrowserProvider(
      (window as MetamaskWindow).ethereum
    );
    const signer = await provider.getSigner(sender);

    const tx = {
      from: asset,
      to: recipient,
      amount: amountNumber,
    };

    const erc = new ethers.Contract(asset, erc20Abi, signer);
    const bridge = new ethers.Contract(
      NAMADA_INTERFACE_CONTRACT_ADDR_ETH_BRIDGE,
      ethereumBridgeAbi,
      signer
    );
    await erc.approve(bridge.target, amountNumber);
    const pendingTx = await bridge.transferToNamada([tx], 1);
    await pendingTx.wait();

    window.dispatchEvent(new Event(MetamaskEvents.BridgeTransferCompleted));
  }

  public async queryBalances(owner: string): Promise<TokenBalance[]> {
    if (!window.ethereum) {
      throw Error("Etherum provider not found");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const ethBalance = await provider.getBalance(owner);
    // TODO: Re-enable the following when we Erc20 tokens are fully supported:
    // const signer = await provider.getSigner(owner);

    // const erc = new ethers.Contract(
    //   //TODO: fix after we support add support for any kind of Erc20 token
    //   Tokens["TESTERC20"].nativeAddress as string,
    //   erc20Abi,
    //   signer
    // );
    // const testErc20Balance: bigint = await erc.balanceOf(signer.address);

    return [
      { token: "ETH", amount: String(ethBalance) || "0" },
      // { token: "TESTERC20", amount: String(testErc20Balance) || "0" },
    ];
  }
}

export default Metamask;
