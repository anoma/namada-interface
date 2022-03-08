import { registeredCoinTypes, RegisteredCoinType } from "slip44";

export type TokenType = "BTC" | "LTC" | "ETH" | "DOT";

type TokenInfo = {
  symbol: string;
  type: number;
  path: number;
  coin: string;
  url: string;
  address?: string;
};

type Tokens = {
  [key: string]: TokenInfo;
};

// Declare symbols for tokens we support:
const SYMBOLS = ["BTC", "LTC", "ETH", "DOT"];

export const Tokens: Tokens = registeredCoinTypes
  .filter(([, , symbol]) => {
    return SYMBOLS.indexOf(`${symbol}`) > -1;
  })
  .reduce((tokens: Tokens, coinType: RegisteredCoinType) => {
    const [type, path, symbol, coin, url] = coinType;

    tokens[symbol as TokenType] = {
      type,
      path,
      symbol,
      coin,
      url,
    } as TokenInfo;

    return tokens;
  }, {});

// Map a few test addresses for now:
Tokens["BTC"].address =
  "atest1v4ehgw36xdzryve5gsc52veeg5cnsv2yx5eygvp38qcrvd29xy6rys6p8yc5xvp4xfpy2v694wgwcp";
Tokens["ETH"].address =
  "atest1v4ehgw36xqmr2d3nx3ryvd2xxgmrq33j8qcns33sxezrgv6zxdzrydjrxveygd2yxumrsdpsf9jc2p";
Tokens["DOT"].address =
  "atest1v4ehgw36gg6nvs2zgfpyxsfjgc65yv6pxy6nwwfsxgungdzrggeyzv35gveyxsjyxymyz335hur2jn";
