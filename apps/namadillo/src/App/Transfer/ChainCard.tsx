import { Chain } from "@chain-registry/types";
import clsx from "clsx";
import { getChainImageUrl } from "integrations/utils";

type ChainCardProps = {
  chain: Chain;
};

export const ChainCard = ({ chain }: ChainCardProps): JSX.Element => {
  const image = getChainImageUrl(chain);
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
