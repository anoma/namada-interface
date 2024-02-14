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
export const CosmosSymbols = ["ATOM", "OSMO"] as const;
export type CosmosMinDenom = "uatom" | "uosmo";
export type CosmosTokenType = (typeof CosmosSymbols)[number];
export type CosmosTokenLookup = Record<CosmosTokenType, TokenInfo>;
