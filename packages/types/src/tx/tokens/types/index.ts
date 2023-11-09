import {
  registeredCoinTypes,
  RegisteredCoinType,
  RegisteredCoinSymbol,
} from "slip44";

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
export const Symbols = [
  "NAM",
  "ATOM",
  "ETH",
  "TESTERC20",
  "NUTTESTERC20",
] as const;

export type TokenType = typeof Symbols[number];
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
  type: 123456,
  path: 2147483651,
  symbol: "NAM",
  coin: "Namada",
  url: "https://namada.net",
  address: "tnam1q99c37u38grkdcc2qze0hz4zjjd8zr3yucd3mzgz",
};

// TODO: We don't have a address for this. The address for DOT
// from the dev & e2e genesis is being used here:
Tokens["ATOM"].address = "tnam1qx6k4wau5t6m8g2hjq55fje2ynpvh5t27s8p3p0l";
Tokens["ATOM"].coinGeckoId = "cosmos";

Tokens["ETH"].address = "tnam1qyr9vd8ltunq72qc7pk58v7jdsedt4mggqqpxs03";
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
