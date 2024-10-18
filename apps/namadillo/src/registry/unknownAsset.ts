import { Asset } from "@chain-registry/types";

export const unknownAsset: Asset = {
  name: "Unknown",
  base: "?",
  display: "?",
  symbol: "?",
  denom_units: [{ denom: "?", exponent: 0 }],
};
