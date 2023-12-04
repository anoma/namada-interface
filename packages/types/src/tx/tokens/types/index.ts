import { registeredCoinTypes, RegisteredCoinType } from "slip44";

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

// Declare symbols for tokens we support:
export const Symbols = ["NAM", "ATOM", "ETH"] as const;

export type TokenType = (typeof Symbols)[number];
type Tokens = Record<TokenType, TokenInfo>;

const supportedCoinTypes: RegisteredCoinType[] = [
  ...registeredCoinTypes.filter(([, , symbol]) => {
    return Symbols.indexOf(`${symbol as TokenType}`) > -1;
  }),
];

export const Tokens = supportedCoinTypes.reduce(
  (tokens: Tokens, coinType: RegisteredCoinType) => {
    const [type, path, symbol = "", coin, url = ""] = coinType;

    tokens[`${symbol as TokenType}`] = {
      address: "",
      type,
      path,
      symbol,
      coin,
      url,
    };

    return tokens;
  },
  {} as Tokens
);

// Map a few test addresses for now:
Tokens["NAM"] = {
  ...Tokens["NAM"],
  url: "https://namada.net",
  address: "tnam1qxuqn53dtcckynnm35n8s27cftxcqym7gvesjrp9",
};

// TODO: We don't have a address for this. The address for DOT
// from the dev & e2e genesis is being used here:
Tokens["ATOM"] = {
  ...Tokens["ATOM"],
  address: "tnam1qy67tz9xlutanq0mzj2jjvf4ldw7f43dgcfe6hyd",
  coinGeckoId: "cosmos",
};

Tokens["ETH"] = {
  ...Tokens["ETH"],
  address: "tnam1qxp8e9hqtcwpxsmene9ht97el0gh2s6m9slwv09s",
  coinGeckoId: "ethereum",
};

export type TokenBalance = { token: TokenType; amount: string };
