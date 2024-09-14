import clsx from "clsx";
import { GoChevronDown } from "react-icons/go";
import { Chain } from "types";

type ChainSelectBoxProps = {
  chain?: Chain;
  onClick?: () => void;
};

export const ChainSelectBox = ({
  chain,
  onClick,
}: ChainSelectBoxProps): JSX.Element => {
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
          <i
            className={clsx(
              "flex items-center justify-center w-7 h-7 rounded-full bg-neutral-900 relative ",
              "before:h-[55%] before:w-[55%] before:bg-neutral-700 before:rounded-full group-hover:before:bg-neutral-600",
              "before:transition-colors before:duration-300"
            )}
          />
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
