import clsx from "clsx";
import { GoChevronDown } from "react-icons/go";
import { Chain, WalletProvider } from "types";
import { EmptyResourceIcon } from "./EmptyResourceIcon";

type SelectedChainProps = {
  chain?: Chain;
  wallet?: WalletProvider;
  onClick?: () => void;
};

export const SelectedChain = ({
  chain,
  wallet,
  onClick,
}: SelectedChainProps): JSX.Element => {
  const selectorClassList = clsx(
    `flex items-center gap-2.5 text-white font-light cursor-pointer`
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
          `${chain.name} chain is selected`
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
