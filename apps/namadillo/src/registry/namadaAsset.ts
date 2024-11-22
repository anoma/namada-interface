import { Asset } from "@chain-registry/types";
import namadaShieldedSvg from "./assets/namada-shielded.svg";

const { VITE_LOCALNET: localnet = false, VITE_LOCALNET_NAM_TOKEN: localToken } =
  import.meta.env;

export const namadaAsset = {
  name: "Namada",
  base: "unam",
  address:
    localnet && localToken ? localToken : (
      "tnam1qxp7u2vmlgcrpn9j0ml7hrtr79g2w2fdesteh7tu"
    ),
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
