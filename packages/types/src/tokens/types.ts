export type TokenInfo = {
  symbol: string;
  type: number;
  path: number;
  coin: string;
  url: string;
  address: string;
  nativeAddress?: string;
  isNut?: boolean;
  coinGeckoId?: string;
};

// Tokens in Namada
export const Symbols = [
  "NAM",
  "BTC",
  "DOT",
  "ETH",
  "SCH",
  "APF",
  "KAR",
] as const;

export type TokenType = (typeof Symbols)[number];
export type TokenLookup = Record<TokenType, TokenInfo>;

// Tokens in Cosmos ecosystem
export const CosmosSymbols = [
  "ATOM",
  "OSMO",
  "ION",
  "SCRT",
  "AKT",
  "CRO",
  "CTK",
  "IRIS",
  "REGEN",
  "XPRT",
  "DVPN",
  "BOOT",
  "JUNO",
  "STARS",
  "AXL",
  "SOMM",
  "UMEE",
  "GRAV",
  "STRD",
  "EVMOS",
  "INJ",
] as const;

export type CosmosMinDenom =
  | "uatom"
  | "uosmo"
  | "uion"
  | "uscrt"
  | "uakt"
  | "basecro"
  | "uctk"
  | "uiris"
  | "uregen"
  | "uxprt"
  | "udvpn"
  | "boot"
  | "ujuno"
  | "ustars"
  | "uaxl"
  | "usomm"
  | "uumee"
  | "ugraviton"
  | "ustrd"
  | "aevmos"
  | "inj";

export type CosmosTokenType = (typeof CosmosSymbols)[number];
export type CosmosTokenLookup = Record<CosmosTokenType, TokenInfo>;
