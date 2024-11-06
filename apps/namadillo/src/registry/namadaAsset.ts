import { Asset } from "@chain-registry/types";
import namadaShieldedSvg from "./assets/namada-shielded.svg";

export const namadaAsset: Asset = {
  name: "Namada",
  base: "tnam1qy440ynh9fwrx8aewjvvmu38zxqgukgc259fzp6h",
  display: "nam",
  symbol: "NAM",
  denom_units: [
    {
      denom: "tnam1qy440ynh9fwrx8aewjvvmu38zxqgukgc259fzp6h",
      exponent: 0,
      aliases: ["unam"],
    },
    {
      denom: "nam",
      exponent: 6,
    },
  ],
  logo_URIs: { svg: namadaShieldedSvg },
};
