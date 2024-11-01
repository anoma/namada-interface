import { Asset } from "@chain-registry/types";

/**
 * Find the exponent of a denom (`uatom`, `atom`, etc).
 * Useful to calculate the token amount with correct decimal part
 * @param asset
 * @param denom
 * @returns The exponent, or zero if not found
 */
export const findExponent = (asset: Asset, denom: string): number =>
  asset.denom_units.find(
    (unit) => unit.denom === denom || unit.aliases?.includes(denom)
  )?.exponent ?? 0;
