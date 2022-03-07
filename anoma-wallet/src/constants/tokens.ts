/* eslint-disable max-len */
export enum TokenType {
  BTC,
  LTC,
  ETH,
  DOT,
}

// Refer to the following for BIP 44 registration (symbol, name, type):
// https://github.com/satoshilabs/slips/blob/master/slip-0044.md
export type Token = {
  symbol: string | null;
  coin: string;
  type: number;
  path: number; // Path component (coin_type')
  address?: string;
};

// TODO: We need to have token addresses for the livenet ledger. Currently, only
// testnet token addresses are listed below:
export const Tokens: Record<TokenType, Token> = {
  [TokenType.BTC]: {
    coin: "Bitcoin",
    symbol: "BTC",
    type: 0,
    path: 0x80000000,
    address:
      "atest1v4ehgw36xdzryve5gsc52veeg5cnsv2yx5eygvp38qcrvd29xy6rys6p8yc5xvp4xfpy2v694wgwcp",
  },
  [TokenType.LTC]: {
    coin: "Litecoin",
    symbol: "LTC",
    type: 2,
    path: 0x80000002,
  },
  [TokenType.ETH]: {
    coin: "Ethereum",
    symbol: "ETH",
    type: 60,
    path: 0x8000003c,
    address:
      "atest1v4ehgw36xqmr2d3nx3ryvd2xxgmrq33j8qcns33sxezrgv6zxdzrydjrxveygd2yxumrsdpsf9jc2p",
  },
  [TokenType.DOT]: {
    coin: "Polkadot",
    symbol: "DOT",
    type: 354,
    path: 0x80000162,
    address:
      "atest1v4ehgw36gg6nvs2zgfpyxsfjgc65yv6pxy6nwwfsxgungdzrggeyzv35gveyxsjyxymyz335hur2jn",
  },
};
