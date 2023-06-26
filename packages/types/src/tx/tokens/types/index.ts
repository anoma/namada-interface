import { registeredCoinTypes, RegisteredCoinType } from "slip44";

type TokenInfo = {
  symbol: string;
  type: number;
  path: number;
  coin: string;
  url: string;
  address?: string;
  coinGeckoId?: string;
};

// Declare symbols for tokens we support:
export const Symbols = ["NAM", "ATOM", "ETH"] as const;

export type TokenType = typeof Symbols[number];
type Tokens = Record<TokenType, TokenInfo>;

export const Tokens = registeredCoinTypes
  .filter(([, , symbol]) => {
    return Symbols.indexOf(`${symbol as TokenType}`) > -1;
  })
  .reduce((tokens: Tokens, coinType: RegisteredCoinType) => {
    const [type, path, symbol = "", coin, url = ""] = coinType;

    tokens[`${symbol as TokenType}`] = {
      type,
      path,
      symbol,
      coin,
      url,
    };

    return tokens;
  }, {} as Tokens);

// Map a few test addresses for now:
Tokens["NAM"] = {
  type: 123456,
  path: 2147483651,
  symbol: "NAM",
  coin: "Namada",
  url: "https://namada.net",
  address:
    "atest1v4ehgw36x3prswzxggunzv6pxqmnvdj9xvcyzvpsggeyvs3cg9qnywf589qnwvfsg5erg3fkl09rg5",
};

Tokens["ATOM"].address =
  "atest1v4ehgw36gfryydj9g3p5zv3kg9znyd358ycnzsfcggc5gvecgc6ygs2rxv6ry3zpg4zrwdfeumqcz9";
Tokens["ATOM"].coinGeckoId = "cosmos";

Tokens["ETH"].address =
  "atest1v4ehgw36xqmr2d3nx3ryvd2xxgmrq33j8qcns33sxezrgv6zxdzrydjrxveygd2yxumrsdpsf9jc2p";
Tokens["ETH"].coinGeckoId = "ethereum";

export type TokenBalance = { token: TokenType; amount: string };
