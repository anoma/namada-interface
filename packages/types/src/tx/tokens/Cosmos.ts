import { TokenType } from "./types";

// Look up TokenType by min-denom token for Cosmos
// TODO: As Cosmos tokens are added to our TokenType, map corresponding denom from Keplr config
// See: https://github.com/chainapsis/keplr-wallet/blob/master/packages/extension/src/config.ts for all values in Keplr
export const CosmosTokens: Record<string, TokenType> = {
  uatom: "ATOM",
  "ibc/1184DE739EAF4AE43E3B604FF9A1FEB6F555427EB809D230427FBE5C75478CE7": "IBC",
};
