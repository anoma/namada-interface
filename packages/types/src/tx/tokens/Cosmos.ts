export type CosmosMinDenom = "uatom";
export type CosmosTokenType = "ATOM";
// TODO: As Cosmos tokens are added to our TokenType, map corresponding denom from Keplr config
// See: https://github.com/chainapsis/keplr-wallet/blob/master/packages/extension/src/config.ts for all values in Keplr

type CosmosDenom = [CosmosMinDenom, CosmosTokenType];
const CosmosTokenDenoms: CosmosDenom[] = [
  ["uatom", "ATOM"]
]

const tokenDenomLookup = (param: CosmosMinDenom | CosmosTokenType): CosmosDenom | undefined =>
  CosmosTokenDenoms.find((tokenDenom: CosmosDenom) => tokenDenom.includes(param));

export const tokenByMinDenom = (minDenom: CosmosMinDenom): string => {
  const tokenDenom = tokenDenomLookup(minDenom)
  return tokenDenom ? tokenDenom[1] : ""
}

export const minDenomByToken = (token: CosmosTokenType): string => {
  const tokenDenom = tokenDenomLookup(token)
  return tokenDenom ? tokenDenom[0] : "";
}
