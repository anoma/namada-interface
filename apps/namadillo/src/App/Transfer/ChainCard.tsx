import { Chain } from "@chain-registry/types";
import clsx from "clsx";

type ChainCardProps = {
  chain: Chain;
};

export const ChainCard = ({ chain }: ChainCardProps): JSX.Element => {
  return (
    <span
      className={clsx(
        "grid grid-cols-[40px_auto] gap-6 w-full px-4 py-2.5 items-center"
      )}
    >
      <img src={chain.logo_URIs?.svg} alt={chain.pretty_name + " logo"} />
      <span className="text-left">{chain.pretty_name}</span>
    </span>
  );
};
