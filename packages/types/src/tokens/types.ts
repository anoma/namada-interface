import BigNumber from "bignumber.js";

import { TokenType } from "./Namada";

export type TokenInfo<D extends string = string> = {
  symbol: string;
  type: number;
  path: number;
  coin: string;
  address: string;
  minDenom: D;
  decimals: number;
  nativeAddress?: string;
  isNut?: boolean;
  coinGeckoId?: string;
  url?: string;
};

export type TokenBalances<T extends string = TokenType> = Partial<
  Record<T, BigNumber>
>;
