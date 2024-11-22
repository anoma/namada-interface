import { Asset } from "@chain-registry/types";
import { localnetConfigAtom } from "atoms/integrations";
import { getDefaultStore } from "jotai";
import namadaShieldedSvg from "./assets/namada-shielded.svg";

// We can't return "satisfies Asset" from fn
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const namadaAsset = () => {
  const store = getDefaultStore();
  const config = store.get(localnetConfigAtom);
  const localNamAddress = config.data?.tokenAddress;

  return {
    name: "Namada",
    base: "unam",
    address: localNamAddress || "tnam1qxp7u2vmlgcrpn9j0ml7hrtr79g2w2fdesteh7tu",
    display: "nam",
    symbol: "NAM",
    denom_units: [
      {
        denom: "unam",
        exponent: 0,
      },
      {
        denom: "nam",
        exponent: 6,
      },
    ],
    logo_URIs: { svg: namadaShieldedSvg },
  } satisfies Asset;
};
