import { ExtensionKey } from "@namada/types";
import { WalletProvider } from "types";
import keplrSvg from "./assets/keplr.svg";
import namadaSvg from "./assets/namada.svg";

export const wallets: Partial<Record<ExtensionKey, WalletProvider>> = {
  keplr: {
    id: "keplr",
    name: "Keplr",
    iconUrl: keplrSvg,
    downloadUrl: {
      chrome:
        "https://chromewebstore.google.com/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap",
      firefox: "https://addons.mozilla.org/en-US/firefox/addon/keplr/",
    },
  },

  namada: {
    id: "namada",
    name: "Namada",
    iconUrl: namadaSvg,
    downloadUrl: {
      chrome:
        "https://chromewebstore.google.com/detail/namada-keychain/hnebcbhjpeejiclgbohcijljcnjdofek",
      firefox: "",
    },
  },
};
