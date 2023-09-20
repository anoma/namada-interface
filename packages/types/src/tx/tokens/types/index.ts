import {
  registeredCoinTypes,
  RegisteredCoinType,
  RegisteredCoinSymbol,
} from "slip44";

type TokenInfo = {
  symbol: string;
  type: number;
  path: number;
  coin: string;
  url: string;
  address?: string;
  nativeAddress?: string;
  isNut?: boolean;
  coinGeckoId?: string;
};

// Declare symbols for tokens we support:
export const Symbols = [
  "NAM",
  "ATOM",
  "IBC",
  "ETH",
  "TESTERC20",
  "NUTTESTERC20",
] as const;

export type TokenType = (typeof Symbols)[number];
type Tokens = Record<TokenType, TokenInfo>;

const nuterc20 = [
  -999,
  -999,
  "NUTTESTERC20" as RegisteredCoinSymbol,
  "NUTtesterc20",
] as RegisteredCoinType;

const erc20 = [
  -999,
  -999,
  "TESTERC20" as RegisteredCoinSymbol,
  "testerc20",
] as RegisteredCoinType;

const supportedCoinTypes: RegisteredCoinType[] = [
  ...registeredCoinTypes.filter(([, , symbol]) => {
    return Symbols.indexOf(`${symbol as TokenType}`) > -1;
  }),
  erc20,
  nuterc20,
];

export const Tokens = supportedCoinTypes.reduce(
  (tokens: Tokens, coinType: RegisteredCoinType) => {
    const [type, path, symbol = "", coin, url = ""] = coinType;

    tokens[`${symbol as TokenType}`] = {
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
  type: 123456,
  path: 2147483651,
  symbol: "NAM",
  coin: "Namada",
  url: "https://namada.net",
  address:
    "atest1v4ehgw36x3prswzxggunzv6pxqmnvdj9xvcyzvpsggeyvs3cg9qnywf589qnwvfsg5erg3fkl09rg5",
};

// TODO - IBC tokens need to be handled better than this!
Tokens["IBC"] = {
  ...Tokens["NAM"],
  address: "atest1v4ehgw36gfryydj9g3p5zv3kg9znyd358ycnzsfcggc5gvecgc6ygs2rxv6ry3zpg4zrwdfeumqcz8"
};

Tokens["ATOM"].address =
  "atest1v4ehgw36gfryydj9g3p5zv3kg9znyd358ycnzsfcggc5gvecgc6ygs2rxv6ry3zpg4zrwdfeumqcz9";
Tokens["ATOM"].coinGeckoId = "cosmos";

Tokens["ETH"].address =
  "atest1v4ehgw36xqmr2d3nx3ryvd2xxgmrq33j8qcns33sxezrgv6zxdzrydjrxveygd2yxumrsdpsf9jc2p";
Tokens["ETH"].coinGeckoId = "ethereum";

Tokens["TESTERC20"].address =
  "atest1v46xsw368psnwwf3xcerqeryxcervvpsxuukye3cxsukgce4x5mrwctyvvekvvnxv33nxvfc0kmacx";
Tokens["TESTERC20"].nativeAddress =
  "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";
Tokens["TESTERC20"].coinGeckoId = "testerc20";

Tokens["NUTTESTERC20"].address =
  "atest1de6hgw368psnwwf3xcerqeryxcervvpsxuukye3cxsukgce4x5mrwctyvvekvvnxv33nxvfcmh3pul";
Tokens["NUTTESTERC20"].nativeAddress =
  "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318";
Tokens["NUTTESTERC20"].isNut = true;
Tokens["NUTTESTERC20"].coinGeckoId = "NUTtesterc20";

export type TokenBalance = { token: TokenType; amount: string };
