/* eslint-disable max-len */
export enum TokenType {
  XAN,
  BTC,
  ETH,
  DOT,
}

export type Token = {
  symbol: string;
  name: string;
  address: string;
};

// TODO: We need to have token addresses for the livenet. Currently, only
// testnet token addresses are listed below:
export const Tokens: Record<TokenType, Token> = {
  [TokenType.XAN]: {
    symbol: "XAN",
    name: "Anoma",
    address:
      "atest1v4ehgw36x3prswzxggunzv6pxqmnvdj9xvcyzvpsggeyvs3cg9qnywf589qnwvfsg5erg3fkl09rg5",
  },
  [TokenType.BTC]: {
    symbol: "BTC",
    name: "Bitcoin",
    address:
      "atest1v4ehgw36xdzryve5gsc52veeg5cnsv2yx5eygvp38qcrvd29xy6rys6p8yc5xvp4xfpy2v694wgwcp",
  },
  [TokenType.ETH]: {
    symbol: "ETH",
    name: "Ethereum",
    address:
      "atest1v4ehgw36xqmr2d3nx3ryvd2xxgmrq33j8qcns33sxezrgv6zxdzrydjrxveygd2yxumrsdpsf9jc2p",
  },
  [TokenType.DOT]: {
    symbol: "DOT",
    name: "Polkadot",
    address:
      "atest1v4ehgw36gg6nvs2zgfpyxsfjgc65yv6pxy6nwwfsxgungdzrggeyzv35gveyxsjyxymyz335hur2jn",
  },
};
