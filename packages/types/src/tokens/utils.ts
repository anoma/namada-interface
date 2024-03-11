import { registeredCoinTypes } from "slip44";

import { TokenInfo } from "./types";

type Slip44Info = Pick<TokenInfo, "type" | "path" | "symbol" | "coin">;

export const getSlip44Info = (symbol: string): Slip44Info => {
  const registeredCoinType = registeredCoinTypes.find(
    ([, , someSymbol]) => someSymbol === symbol
  );

  if (!registeredCoinType) {
    throw new Error(`no registered coin type found for ${symbol}`);
  }

  const [coinType, derivationPathComponent, , name] = registeredCoinType;

  return {
    type: coinType,
    path: derivationPathComponent,
    symbol,
    coin: name,
  };
};
