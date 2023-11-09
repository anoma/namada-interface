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
  address: "tnam1q99c37u38grkdcc2qze0hz4zjjd8zr3yucd3mzgz",
};

// TODO: We don't have a address for this. The address for DOT
// from the dev & e2e genesis is being used here:
Tokens["ATOM"] = {
  ...Tokens["ATOM"],
  address: "tnam1qx6k4wau5t6m8g2hjq55fje2ynpvh5t27s8p3p0l",
  coinGeckoId: "cosmos",
};

Tokens["ETH"] = {
  ...Tokens["ETH"],
  address: "tnam1qyr9vd8ltunq72qc7pk58v7jdsedt4mggqqpxs03",
  coinGeckoId: "ethereum",
};

export type TokenBalance = { token: TokenType; amount: string };
