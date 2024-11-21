import {
  Keplr,
  Window as KeplrWindow,
  OfflineAminoSigner,
  OfflineDirectSigner,
} from "@keplr-wallet/types";
import { ChainRegistryEntry } from "types";
import { WalletConnector } from "./types";
import { basicConvertToKeplrChain } from "./utils";

type Signer = OfflineAminoSigner & OfflineDirectSigner;

export class KeplrWalletManager implements WalletConnector {
  install(): void {
    console.warn(
      "Keplr is not available. Redirecting to the Keplr download page..."
    );
    window.open("https://www.keplr.app/get", "_blank");
  }

  private async _get(): Promise<Keplr | undefined> {
    if ((window as KeplrWindow).keplr) {
      return (window as KeplrWindow).keplr;
    }

    if (document.readyState === "complete") {
      return (window as KeplrWindow).keplr;
    }

    return new Promise<Keplr | undefined>((resolve) => {
      const documentStateChange = (event: Event): void => {
        if (
          event.target &&
          (event.target as Document).readyState === "complete"
        ) {
          resolve((window as KeplrWindow).keplr);
          document.removeEventListener("readystatechange", documentStateChange);
        }
      };

      document.addEventListener("readystatechange", documentStateChange);
    });
  }

  async get(): Promise<Keplr> {
    const keplr = await this._get();
    return keplr!;
  }

  async connect(registry: ChainRegistryEntry): Promise<void> {
    const keplr = await this.get();
    await keplr.experimentalSuggestChain(
      basicConvertToKeplrChain(registry.chain, registry.assets.assets)
    );
  }

  async getAddress(chainId: string): Promise<string> {
    const keplr = await this.get();
    const keplrKey = await keplr.getKey(chainId);
    return keplrKey.bech32Address;
  }

  async getSigner(chainId: string): Promise<Signer> {
    const keplr = await this.get();
    return keplr.getOfflineSigner(chainId);
  }
}
