import {
  Window as KeplrWindow,
  OfflineAminoSigner,
  OfflineDirectSigner,
} from "@keplr-wallet/types";
import { ChainRegistryEntry } from "types";
import { WalletConnector } from "./types";
import { basicConvertToKeplrChain } from "./utils";

type Signer = OfflineAminoSigner & OfflineDirectSigner;
const keplr = (window as KeplrWindow).keplr!;

export class KeplrWalletManager implements WalletConnector {
  async connect(registry: ChainRegistryEntry): Promise<void> {
    await keplr.experimentalSuggestChain(
      basicConvertToKeplrChain(registry.chain, registry.assets.assets)
    );
  }

  async getAddress(chainId: string): Promise<string> {
    const keplrKey = await keplr.getKey(chainId);
    return keplrKey.bech32Address;
  }

  getSigner(chainId: string): Signer {
    return keplr.getOfflineSigner(chainId);
  }
}
