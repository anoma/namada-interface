import { WalletProvider } from "types";
import keplrSvg from "./assets/keplr.svg";
import namadaSvg from "./assets/namada.svg";

const namada: WalletProvider = {
  id: "namada",
  name: "Namada",
  iconUrl: namadaSvg,
  downloadUrl: {
    chrome:
      "https://chromewebstore.google.com/detail/namada-keychain/hnebcbhjpeejiclgbohcijljcnjdofek",
    firefox: "",
  },
};

const keplr: WalletProvider = {
  id: "keplr",
  name: "Keplr",
  iconUrl: keplrSvg,
  downloadUrl: {
    chrome:
      "https://chromewebstore.google.com/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap",
    firefox: "https://addons.mozilla.org/en-US/firefox/addon/keplr/",
  },
};

export const wallets = {
  namada,
  keplr,
} as const;
