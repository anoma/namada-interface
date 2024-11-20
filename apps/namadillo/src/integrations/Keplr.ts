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
    console.warn("Keplr is not available. Redirecting to the Keplr download page...");
    window.open("https://www.keplr.app/get", "_blank");
  }
  
  get(): Keplr {
    const keplr = (window as KeplrWindow).keplr;
    if (!keplr) this.install();
    return keplr!;
  }

  async connect(registry: ChainRegistryEntry): Promise<void> {
    await this.get().experimentalSuggestChain(
      basicConvertToKeplrChain(registry.chain, registry.assets.assets)
    );
  }

  async getAddress(chainId: string): Promise<string> {
    const keplrKey = await this.get().getKey(chainId);
    return keplrKey.bech32Address;
  }

  getSigner(chainId: string): Signer {
    return this.get().getOfflineSigner(chainId);
  }
}
