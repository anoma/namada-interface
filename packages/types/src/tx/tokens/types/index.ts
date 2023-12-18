import { RegisteredCoinType, registeredCoinTypes } from "slip44";

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
// TODO: This will need to be refactored for mainnet!
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

Tokens["DOT"] = {
  ...Tokens["DOT"],
  address: "tnam1q9dg4r9uteahgx7qyc2h8crq3lg7zrxdduwyrss4",
  coinGeckoId: "polkadot",
};

Tokens["ETH"] = {
  ...Tokens["ETH"],
  address: "tnam1q9anasrx0gqeuxrc22a0uefe82kw08avhcasevng",
  coinGeckoId: "ethereum",
};

Tokens["BTC"] = {
  ...Tokens["BTC"],
  address: "tnam1qxwpxk3t4rwwshuwudkj9j2565gey088753n4ska",
  coinGeckoId: "bitcoin",
};

Tokens["SCH"] = {
  ...Tokens["SCH"],
  coin: "Schnitzel",
  symbol: "SCH",
  address: "tnam1q9u0qaas5dc7h56ezwsmcurdt7h5ksv7csel5lm9",
};

Tokens["APF"] = {
  ...Tokens["APF"],
  coin: "Apfel",
  symbol: "APF",
  address: "tnam1qxv8l458h02uf56g5s3zx7g36uqc5fn0hy208d8d",
};

Tokens["KAR"] = {
  ...Tokens["KAR"],
  coin: "Kartoffel",
  symbol: "KAR",
  address: "tnam1qxajrany4v37lpvxcsqxjax8sxvuc3zszu7gr406",
};

export type TokenBalance = { token: TokenType; amount: string };
