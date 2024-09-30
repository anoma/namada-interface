import { Chain } from "@chain-registry/types";
import clsx from "clsx";
import { GoChevronDown } from "react-icons/go";
import { WalletProvider } from "types";

import { EmptyResourceIcon } from "./EmptyResourceIcon";

type SelectedChainProps = {
  chain?: Chain;
  wallet?: WalletProvider;
  onClick?: () => void;
  iconSize?: string;
};

export const SelectedChain = ({
  chain,
  wallet,
  onClick,
  iconSize,
}: SelectedChainProps): JSX.Element => {
  const selectorClassList = clsx(
    `flex items-center gap-2.5 text-white font-light`,
    { "cursor-auto": !onClick }
  );

  const isDisabled = !wallet;

  return (
    <button
      type="button"
      className={clsx("block group", {
        "pointer-events-none opacity-30": isDisabled,
      })}
      disabled={isDisabled}
      onClick={onClick}
      aria-description={
        wallet && chain ?
          `${chain.pretty_name} chain is selected`
        : `No chain selected`
      }
    >
      {(!wallet || !chain) && (
        <span className={selectorClassList}>
          <EmptyResourceIcon className="w-7" />
          Select chain
          <GoChevronDown className="text-sm" />
        </span>
      )}
      {wallet && chain && (
        <span className={selectorClassList}>
          <img
            className="aspect-square object-cover object-center bg-neutral-800 rounded-full select-none"
            alt={`${chain.pretty_name} image`}
            src={chain.logo_URIs?.svg}
            style={{ width: iconSize || "30px" }}
          />
          {chain.pretty_name}
          {onClick && <GoChevronDown className="text-sm" />}
        </span>
      )}
    </button>
  );
};
