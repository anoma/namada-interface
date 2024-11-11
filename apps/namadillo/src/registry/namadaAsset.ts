import { Asset } from "@chain-registry/types";
import namadaShieldedSvg from "./assets/namada-shielded.svg";

export const namadaAsset = {
  name: "Namada",
  base: "unam",
  address: "tnam1qy440ynh9fwrx8aewjvvmu38zxqgukgc259fzp6h",
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
