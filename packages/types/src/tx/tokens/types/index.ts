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

export type TokenType = typeof Symbols[number];
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
  address: "tnam1q9mjvqd45u7w54kee2aquugtv7vn7h3xrcrau7xy",
};

// TODO: We don't have a address for this. The address for DOT
// from the dev & e2e genesis is being used here:
Tokens["ATOM"] = {
  ...Tokens["ATOM"],
  address: "tnam1q9dg4r9uteahgx7qyc2h8crq3lg7zrxdduwyrss4",
  coinGeckoId: "cosmos",
};

Tokens["ETH"] = {
  ...Tokens["ETH"],
  address: "tnam1q9anasrx0gqeuxrc22a0uefe82kw08avhcasevng",
  coinGeckoId: "ethereum",
};

export type TokenBalance = { token: TokenType; amount: string };
