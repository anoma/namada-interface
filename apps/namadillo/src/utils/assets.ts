import { Asset } from "@chain-registry/types";
import { IbcToken, NativeToken } from "@namada/indexer-client";
import { shortenAddress } from "@namada/utils";

export const unknownAsset = (denom: string): Asset => ({
  denom_units: [{ denom, exponent: 0 }],
  base: denom,
  name: denom,
  display: denom,
  symbol: shortenAddress(denom, 4, 4),
});

// TODO upgrade this function to be as smart as possible
// please refer to `tnamAddressToDenomTrace` and how we could combine both
export const findAssetByToken = (
  token: NativeToken | IbcToken,
  assets: Asset[]
): Asset | undefined => {
  if ("trace" in token) {
    const traceDenom = token.trace.split("/").at(-1);
    if (traceDenom) {
      for (let i = 0; i < assets.length; i++) {
        const asset = assets[i];
        if (
          asset.base === traceDenom ||
          asset.denom_units.find(
            (u) => u.denom === traceDenom || u.aliases?.includes(traceDenom)
          )
        ) {
          return asset;
        }
      }
    }
  }
  return undefined;
};
