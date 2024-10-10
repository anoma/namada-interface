import { Chain } from "@chain-registry/types";
import clsx from "clsx";
import genericAsset from "./assets/generic-asset.svg";

type ChainCardProps = {
  chain: Chain;
};

export const ChainCard = ({ chain }: ChainCardProps): JSX.Element => {
  const image =
    chain.logo_URIs?.svg || chain.logo_URIs?.png || genericAsset || "";
  return (
    <span
      className={clsx(
        "grid grid-cols-[40px_auto] gap-6 w-full px-4 py-2.5 items-center"
      )}
    >
      <img src={image} alt={chain.pretty_name + " logo"} className="mx-auto" />
      <span className="text-left">{chain.pretty_name}</span>
    </span>
  );
};
