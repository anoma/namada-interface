import { RegisteredCoinType, registeredCoinTypes } from "slip44";
import {
  CosmosMinDenom,
  CosmosSymbols,
  CosmosTokenLookup,
  CosmosTokenType,
} from "./types";

// Define tokens and helpers for Cosmos ecosystem

// TODO: As Cosmos tokens are added to our TokenType, map corresponding denom from Keplr config
// See: https://github.com/chainapsis/keplr-wallet/blob/master/packages/extension/src/config.ts for all values in Keplr
type CosmosDenom = [CosmosMinDenom, CosmosTokenType];
const CosmosTokenDenoms: CosmosDenom[] = [
  ["uatom", "ATOM"],
  ["uosmo", "OSMO"],
];

const tokenDenomLookup = (
  param: CosmosMinDenom | CosmosTokenType
): CosmosDenom | undefined =>
  CosmosTokenDenoms.find((tokenDenom: CosmosDenom) =>
    tokenDenom.includes(param)
  );

export const tokenByMinDenom = (minDenom: CosmosMinDenom): string => {
  const tokenDenom = tokenDenomLookup(minDenom);
  return tokenDenom ? tokenDenom[1] : "";
};

export const minDenomByToken = (token: CosmosTokenType): string => {
  const tokenDenom = tokenDenomLookup(token);
  return tokenDenom ? tokenDenom[0] : "";
};

const supportedCoinTypes: RegisteredCoinType[] = registeredCoinTypes.filter(
  ([, , symbol]) => {
    return CosmosSymbols.includes(`${symbol as CosmosTokenType}`);
  }
);

export const CosmosTokens = supportedCoinTypes.reduce(
  (tokens: CosmosTokenLookup, coinType: RegisteredCoinType) => {
    const [type, path, symbol = "", coin, url = ""] = coinType;

    tokens[`${symbol as CosmosTokenType}`] = {
      address: "",
      type,
      path,
      symbol,
      coin,
      url,
    };

    return tokens;
  },
  {} as CosmosTokenLookup
);

CosmosTokens["ATOM"].coinGeckoId = "cosmos";
// NOTE: Osmosis does not have a SLIP-044 entry:
CosmosTokens["OSMO"] = {
  symbol: "OSMO",
  type: 0,
  path: 0,
  coin: "Osmo",
  url: "https://osmosis.zone/",
  address: "",
  coinGeckoId: "osmosis",
};
