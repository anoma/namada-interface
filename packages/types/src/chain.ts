export type Currency = {
  token: string;
  symbol: string;
  gasPriceStep?: {
    low: number;
    average: number;
    high: number;
  };
};

// Define keys for supported extensions
export type ExtensionKey = "anoma" | "keplr" | "metamask";

export type ExtensionInfo = {
  alias: string;
  id: ExtensionKey;
  url: string;
};

// Define constant with extension properties
export const Extensions: Record<ExtensionKey, ExtensionInfo> = {
  anoma: {
    alias: "Anoma",
    id: "anoma",
    url: "https://namada.me/",
  },
  keplr: {
    alias: "Keplr",
    id: "keplr",
    url: "https://www.keplr.app/",
  },
  metamask: {
    alias: "Metamask",
    id: "metamask",
    url: "https://metamask.io/",
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
