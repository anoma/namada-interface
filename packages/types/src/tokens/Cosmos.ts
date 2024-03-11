import { TokenInfo } from "./types";
import { getSlip44Info } from "./utils";

// Tokens in Cosmos ecosystem
export const CosmosSymbols = ["ATOM", "OSMO"] as const;
export type CosmosTokenType = (typeof CosmosSymbols)[number];

const isCosmosToken = (str: string): str is CosmosTokenType =>
  CosmosSymbols.includes(str as CosmosTokenType);

// Min denoms in Cosmos ecosystem
const cosmosMinDenoms = ["uatom", "uosmo"] as const;
export type CosmosMinDenom = (typeof cosmosMinDenoms)[number];

const isCosmosMinDenom = (str: string): str is CosmosMinDenom =>
  cosmosMinDenoms.includes(str as CosmosMinDenom);

// TODO: As Cosmos tokens are added to our TokenType, map corresponding denom
// from Keplr config. See:
// https://github.com/chainapsis/keplr-wallet/blob/master/packages/extension/src/config.ts
// for all values in Keplr
export const CosmosTokens: Record<
  CosmosTokenType,
  TokenInfo<CosmosMinDenom>
> = {
  ATOM: {
    ...getSlip44Info("ATOM"),
    address: "",
    coinGeckoId: "cosmos",
    minDenom: "uatom",
    decimals: 6,
  },

  // NOTE: Osmosis does not have a SLIP-044 entry:
  OSMO: {
    symbol: "OSMO",
    type: 0,
    path: 0,
    coin: "Osmo",
    url: "https://osmosis.zone/",
    address: "",
    coinGeckoId: "osmosis",
    minDenom: "uosmo",
    decimals: 6,
  },
};

export const tokenByMinDenom = (
  minDenom: string
): CosmosTokenType | undefined => {
  if (!isCosmosMinDenom(minDenom)) {
    return undefined;
  }

  for (const token of CosmosSymbols) {
    if (CosmosTokens[token].minDenom === minDenom) {
      return token;
    }
  }

  throw new Error(
    `${minDenom} is a cosmos min denom but is not in CosmosTokens`
  );
};

export const minDenomByToken = (token: string): CosmosMinDenom | undefined =>
  isCosmosToken(token) ? CosmosTokens[token].minDenom : undefined;
