import { WindowWithNamada } from "@namada/types";
import { chainParametersAtom } from "atoms/chain";
import { AttachStatus, ConnectStatus, Wallet } from "integrations/types";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";

export type InjectedNamada = WindowWithNamada["namada"];

export class NamadaKeychain implements Wallet {
  install(): void {
    console.warn(
      "Namada is not available. Redirecting to the Namada download page..."
    );
    window.open("https://www.namada.net/extension", "_blank");
  }

  private async _get(): Promise<InjectedNamada | undefined> {
    if ((window as WindowWithNamada).namada) {
      return (window as WindowWithNamada).namada;
    }

    if (document.readyState === "complete") {
      return (window as WindowWithNamada).namada;
    }

    return new Promise<InjectedNamada | undefined>((resolve) => {
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

  async get(): Promise<InjectedNamada> {
    const namada = await this._get();
    return namada!;
  }

  async connect(chainId: string): Promise<void> {
    const namada = await this.get();
    await namada.connect(chainId);
  }
}

export const useNamadaKeychain = (): [
  attachStatus: AttachStatus,
  connectStatus: ConnectStatus,
  connect: () => Promise<void>,
  namada: NamadaKeychain,
  error?: string,
] => {
  const [attachStatus, setAttachStatus] = useState<AttachStatus>("detached");
  const [connectStatus, setConnectStatus] = useState<ConnectStatus>("idle");
  const [connectError, setConnectError] = useState<string>();
  const { data: chain } = useAtomValue(chainParametersAtom);
  const namadaKeychain = new NamadaKeychain();

  const connect = async (): Promise<void> => {
    if (!chain) {
      return;
    }
    setConnectStatus("connecting");
    namadaKeychain
      .connect(chain.chainId)
      .then(() => {
        console.info(`Connected to keychain with ${chain.chainId}`);
        setConnectStatus("connected");
      })
      .catch((e) => {
        console.error(e);
        setConnectStatus("error");
        setConnectError(e);
      });
  };

  useEffect(() => {
    setAttachStatus("pending");
    namadaKeychain
      .get()
      .then(() => setAttachStatus("attached"))
      .catch(() => setAttachStatus("detached"));
  }, []);

  useEffect(() => {
    if (attachStatus === "attached") {
      if (chain?.chainId) {
        namadaKeychain
          .get()
          .then((namada) =>
            namada
              .isConnected(chain.chainId)
              .then(() =>
                console.info(`Connected to keychain with ${chain.chainId}`)
              )
          );
      }
    }
  }, [chain]);

  return [attachStatus, connectStatus, connect, namadaKeychain, connectError];
};
