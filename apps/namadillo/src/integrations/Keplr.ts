import {
  Keplr,
  Window as KeplrWindow,
  OfflineAminoSigner,
  OfflineDirectSigner,
} from "@keplr-wallet/types";
import { ExtensionKey } from "@namada/types";
import { ChainRegistryEntry } from "types";
import { WalletConnector } from "./types";
import { basicConvertToKeplrChain } from "./utils";

type Signer = OfflineAminoSigner & OfflineDirectSigner;

const notAvailableError = "Keplr is not available.";

export class KeplrWalletManager implements WalletConnector {
  key: ExtensionKey = "keplr";

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

  async get(): Promise<Keplr | undefined> {
    const keplr = await this._get();
    return keplr;
  }

  async connect(registry: ChainRegistryEntry): Promise<void> {
    const keplr = await this.get();
    if (!keplr) {
      throw new Error(notAvailableError);
    }
    await keplr.experimentalSuggestChain(
      basicConvertToKeplrChain(registry.chain, registry.assets.assets)
    );
  }

  async getAddress(chainId: string): Promise<string> {
    const keplr = await this.get();
    if (!keplr) {
      throw new Error(notAvailableError);
    }
    const keplrKey = await keplr.getKey(chainId);
    return keplrKey.bech32Address;
  }

  async getSigner(chainId: string): Promise<Signer> {
    const keplr = await this.get();
    if (!keplr) {
      throw new Error(notAvailableError);
    }
    return keplr.getOfflineSigner(chainId);
  }
}
