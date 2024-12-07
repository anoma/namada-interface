import { Asset } from "@chain-registry/types";
import { SkeletonLoading } from "@namada/components";
import clsx from "clsx";
import { getAssetImageUrl } from "integrations/utils";
import { GoChevronDown } from "react-icons/go";
import { EmptyResourceIcon } from "./EmptyResourceIcon";

type SelectedAssetProps = {
  asset?: Asset;
  isLoading?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
};

export const SelectedAsset = ({
  asset,
  isLoading,
  isDisabled,
  onClick,
}: SelectedAssetProps): JSX.Element => {
  const selectorClassList = clsx(
    `flex items-center gap-4 text-xl text-white font-light cursor-pointer uppercase`
  );

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
            src={getAssetImageUrl(asset)}
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
