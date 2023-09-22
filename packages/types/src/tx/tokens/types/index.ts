import { registeredCoinTypes } from "slip44";

type TokenInfo = {
  symbol: string;
  coin: string;
  address: string;
  nativeAddress?: string;
  isNut?: boolean;
  coinGeckoId?: string;
};

// Declare symbols for tokens we support:
// TODO: remove ETH
export const Symbols = ["NAM", "ATOM", "ETH"] as const;

export type TokenType = (typeof Symbols)[number];

type Tokens = Record<TokenType, TokenInfo>;

const ATOM = registeredCoinTypes[118];
const ETH = registeredCoinTypes[60];

export const Tokens: Tokens = {
  NAM: {
    address:
      "atest1v4ehgw36x3prswzxggunzv6pxqmnvdj9xvcyzvpsggeyvs3cg9qnywf589qnwvfsg5erg3fkl09rg5",
    coin: "Mamada",
    coinGeckoId: "namada",
    symbol: "NAM",
  },
  ATOM: {
    address:
      "atest1v4ehgw36gfryydj9g3p5zv3kg9znyd358ycnzsfcggc5gvecgc6ygs2rxv6ry3zpg4zrwdfeumqcz9",
    coin: ATOM[2] as string,
    coinGeckoId: "cosmons",
    symbol: ATOM[3],
  },
  ETH: {
    address:
      "atest1v4ehgw36xqmr2d3nx3ryvd2xxgmrq33j8qcns33sxezrgv6zxdzrydjrxveygd2yxumrsdpsf9jc2p",
    coin: ETH[2] as string,
    coinGeckoId: "cosmons",
    symbol: ETH[3],
  },
};

//TODO: Not sure if it is even needed
export type TokenBalance = { symbol: string; address: string; amount: string };
