export type CosmosMinDenom = "uatom" | "ibc/1184DE739EAF4AE43E3B604FF9A1FEB6F555427EB809D230427FBE5C75478CE7";
export type CosmosTokenTypes = "ATOM" | "IBC";
// Look up TokenType by min-denom token for Cosmos
// TODO: As Cosmos tokens are added to our TokenType, map corresponding denom from Keplr config
// See: https://github.com/chainapsis/keplr-wallet/blob/master/packages/extension/src/config.ts for all values in Keplr

// TODO: There is a better way of handling translating between ATOM & uatom. The following
// is a quick hack for testing purposes:
export const CosmosTokens: Record<CosmosTokenTypes, CosmosMinDenom> = {
  ATOM: "uatom",
  IBC: "ibc/1184DE739EAF4AE43E3B604FF9A1FEB6F555427EB809D230427FBE5C75478CE7",
};

export const CosmosTokensByMinDenom: Record<CosmosMinDenom, CosmosTokenTypes> = {
  uatom: "ATOM",
  "ibc/1184DE739EAF4AE43E3B604FF9A1FEB6F555427EB809D230427FBE5C75478CE7": "IBC",
}
