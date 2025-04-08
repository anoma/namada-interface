export type Currency = {
  token: string;
  address?: string;
  symbol: string;
  gasPriceStep?: {
    low: number;
    average: number;
    high: number;
  };
};

export enum BridgeType {
  IBC = "ibc",
  Ethereum = "ethereum-bridge",
}

// Define keys for supported extensions
export type ExtensionKey = "namada" | "keplr" | "metamask";

// Define keys for supported chains
export type ChainKey = "namada" | "cosmos" | "ethereum";

export type ExtensionInfo = {
  alias: string;
  id: ExtensionKey;
  url: string;
};

// Define constant with extension properties
export const Extensions = {
  namada: {
    alias: "Namada",
    id: "namada",
    // TODO: Update to most recent release
    url: "https://namada.me",
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
} satisfies Record<ExtensionKey, ExtensionInfo>;

export type Chain = {
  id: ChainKey;
  alias: string;
  bech32Prefix: string;
  bip44: {
    coinType: number;
  };
  bridgeType: BridgeType[];
  chainId: string;
  currency: Currency;
  extension: ExtensionInfo;
  rpc: string;
  ibc?: {
    portId: string;
  };
};

/**
 * Chain name lookup for mainnet and known long-running testnets
 */
export const NamadaChains: Map<string, string> = new Map([
  ["namada.5f5de2dd1b88cba30586420", "Namada Mainnet"],
  ["housefire-alpaca.cc0d3e0c033be", "Housefire Testnet"],
  ["campfire-square.ff09671d333707", "Campfire Testnet"],
]);
