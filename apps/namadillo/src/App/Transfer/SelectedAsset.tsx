import { Asset, Chain } from "@chain-registry/types";
import { SkeletonLoading } from "@namada/components";
import clsx from "clsx";
import { GoChevronDown } from "react-icons/go";
import { EmptyResourceIcon } from "./EmptyResourceIcon";

type SelectedAssetProps = {
  chain?: Chain;
  asset?: Asset;
  isLoading?: boolean;
  onClick?: () => void;
};

export const SelectedAsset = ({
  chain,
  asset,
  isLoading,
  onClick,
}: SelectedAssetProps): JSX.Element => {
  const selectorClassList = clsx(
    `flex items-center gap-4 text-xl text-white font-light cursor-pointer uppercase`
  );

  const isDisabled = !chain;

  return (
    <button
      type="button"
      className={clsx("block group", {
        "pointer-events-none opacity-30": isDisabled || isLoading,
      })}
      disabled={isDisabled}
      onClick={onClick}
      aria-description={
        asset ? `${asset.name} is selected` : `No asset selected`
      }
    >
      {!asset && (
        <span className={selectorClassList}>
          <EmptyResourceIcon className="w-12" />
          {isLoading && (
            <SkeletonLoading
              className="bg-neutral-700"
              height="1em"
              width="70px"
            />
          )}
          {!isLoading && (
            <>
              Asset
              <GoChevronDown className="text-sm" />
            </>
          )}
        </span>
      )}
      {asset && (
        <span
          className={selectorClassList}
          style={{ backgroundColor: asset.logo_URIs?.theme }}
        >
          <img
            className={clsx(
              "w-15 aspect-square object-cover select-none",
              "object-center bg-neutral-800 rounded-full"
            )}
            alt={`${asset.name} image`}
            src={asset.logo_URIs?.svg}
          />
          <span className="flex items-center gap-1">
            {asset.symbol}
            <i className="text-sm">
              <GoChevronDown />
            </i>
          </span>
        </span>
      )}
    </button>
  );
};
