import clsx from "clsx";
import { GoChevronDown } from "react-icons/go";
import { Chain } from "types";
import { EmptyResourceIcon } from "./EmptyResourceIcon";

type SelectedChainProps = {
  chain?: Chain;
  onClick?: () => void;
};

export const SelectedChain = ({
  chain,
  onClick,
}: SelectedChainProps): JSX.Element => {
  const selectorClassList = clsx(
    `flex items-center gap-2.5 text-white font-light cursor-pointer`
  );

  return (
    <button
      type="button"
      className="block group"
      onClick={onClick}
      aria-description={
        chain ? `${chain.name} chain is selected` : `No chain selected`
      }
    >
      {!chain && (
        <span className={selectorClassList}>
          <EmptyResourceIcon className="w-7" />
          Select chain
          <GoChevronDown className="text-sm" />
        </span>
      )}
      {chain && (
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
