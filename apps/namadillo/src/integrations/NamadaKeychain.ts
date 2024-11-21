import { Signer, WindowWithNamada } from "@namada/types";
import { ChainRegistryEntry } from "types";
import { Namada, WalletConnector } from "./types";

export class NamadaWalletManager implements WalletConnector {
  install(): void {
    console.warn(
      "Namada is not available. Redirecting to the Namada download page..."
    );
    window.open("https://www.namada.net/extension", "_blank");
  }

  private async _get(): Promise<Namada | undefined> {
    if ((window as WindowWithNamada).namada) {
      return (window as WindowWithNamada).namada;
    }

    if (document.readyState === "complete") {
      return (window as WindowWithNamada).namada;
    }

    return new Promise<Namada | undefined>((resolve) => {
      const documentStateChange = (event: Event): void => {
        if (
          event.target &&
          (event.target as Document).readyState === "complete"
        ) {
          resolve((window as WindowWithNamada).namada);
          document.removeEventListener("readystatechange", documentStateChange);
        }
      };

      document.addEventListener("readystatechange", documentStateChange);
    });
  }

  async get(): Promise<Namada> {
    const namada = await this._get();
    return namada!;
  }

  async connect(registry: ChainRegistryEntry): Promise<void> {
    const namada = await this.get();
    await namada.connect(registry.chain.chain_id);
  }

  async getAddress(): Promise<string> {
    const namada = await this.get();
    const defaultAccount = await namada.defaultAccount();
    if (!defaultAccount) {
      throw new Error("No accounts found in keychain!");
    }
    return defaultAccount.address;
  }

  async getSigner(): Promise<Signer> {
    const namada = await this.get();
    return namada.getSigner();
  }
}
