import clsx from "clsx";
import { GoChevronDown } from "react-icons/go";
import { Chain, Provider } from "types";
import { EmptyResourceIcon } from "./EmptyResourceIcon";

type SelectedChainProps = {
  chain?: Chain;
  provider?: Provider;
  onClick?: () => void;
};

export const SelectedChain = ({
  chain,
  provider,
  onClick,
}: SelectedChainProps): JSX.Element => {
  const selectorClassList = clsx(
    `flex items-center gap-2.5 text-white font-light cursor-pointer`
  );

  return (
    <button
      type="button"
      className="block group"
      disabled={!provider}
      onClick={onClick}
      aria-description={
        provider && chain ?
          `${chain.name} chain is selected`
        : `No chain selected`
      }
    >
      {(!provider || !chain) && (
        <span className={selectorClassList}>
          <EmptyResourceIcon className="w-7" />
          Select chain
          <GoChevronDown className="text-sm" />
        </span>
      )}
      {provider && chain && (
        <span className={selectorClassList}>
          <img
            className="w-7 h-7 object-cover object-center bg-neutral-800 rounded-full"
            alt={`${chain.name} image`}
            style={{ backgroundImage: `url(${chain.iconUrl})` }}
          />
          {chain.name}
          <GoChevronDown className="text-sm" />
        </span>
      )}
    </button>
  );
};
