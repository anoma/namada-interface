export type Currency = {
  token: string;
  symbol: string;
  gasPriceStep?: {
    low: number;
    average: number;
    high: number;
  };
};

export type ExtensionKey = "anoma" | "keplr" | "metamask";

export type ExtensionInfo = {
  alias: string;
  key: ExtensionKey;
  url: string;
};

export const Extensions: Record<ExtensionKey, ExtensionInfo> = {
  anoma: {
    alias: "Anoma",
    key: "anoma",
    url: "https://namada.me",
  },
  keplr: {
    alias: "Keplr",
    key: "keplr",
    url: "",
  },
  metamask: {
    alias: "Metamask",
    key: "keplr",
    url: "",
  },
};

export type Chain = {
  alias: string;
  bech32Prefix: string;
  bip44: {
    coinType: number;
  };
  chainId: string;
  currency: Currency;
  extension: ExtensionInfo;
  rpc: string;
  ibc?: {
    portId: string;
  };
};
