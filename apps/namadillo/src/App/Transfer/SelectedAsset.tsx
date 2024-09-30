import { Chain } from "@chain-registry/types";
import clsx from "clsx";
import { GoChevronDown } from "react-icons/go";
import { Asset } from "types";
import { EmptyResourceIcon } from "./EmptyResourceIcon";

type SelectedAssetProps = {
  chain?: Chain;
  asset?: Asset;
  onClick?: () => void;
};

export const SelectedAsset = ({
  chain,
  asset,
  onClick,
}: SelectedAssetProps): JSX.Element => {
  const selectorClassList = clsx(
    `flex items-center gap-2.5 text-lg text-white font-light cursor-pointer uppercase`
  );

  const isDisabled = !chain;

  return (
    <button
      type="button"
      className={clsx("block group", {
        "pointer-events-none opacity-30": isDisabled,
      })}
      disabled={isDisabled}
      onClick={onClick}
      aria-description={
        asset ? `${asset.name} is selected` : `No asset selected`
      }
    >
      {!asset && (
        <span className={selectorClassList}>
          <EmptyResourceIcon className="w-15" />
          Asset
          <GoChevronDown className="text-sm" />
        </span>
      )}
      {asset && (
        <span className={selectorClassList}>
          <img
            className="w-7 h-7 object-cover object-center bg-neutral-800 rounded-full"
            alt={`${asset.name} image`}
            style={{ backgroundImage: `url(${asset.iconUrl})` }}
          />
          {asset.denomination}
          <GoChevronDown />
        </span>
      )}
    </button>
  );
};
