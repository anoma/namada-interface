import { formatPercentage, shortenAddress } from "@namada/utils";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { GoGlobe } from "react-icons/go";
import { IoClose } from "react-icons/io5";
import { twMerge } from "tailwind-merge";
import { Validator } from "types";
import { ValidatorCard } from "./ValidatorCard";

type ValidatorInfoPanel = {
  validator: Validator;
  onClose: () => void;
} & React.ComponentPropsWithRef<"div">;

export const ValidatorInfoPanel = ({
  validator,
  onClose,
  ...props
}: ValidatorInfoPanel): JSX.Element => {
  const {
    className: articleClassName,
    onClick: articleClick,
    ...articleProps
  } = props;

  return (
    <article
      className={twMerge(
        "absolute w-[340px] min-h-[400px] bg-black border border-yellow",
        "text-sm rounded-md px-5 pt-11 pb-6 z-50",
        articleClassName
      )}
      onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation();
        articleClick && articleClick(e);
      }}
      {...articleProps}
    >
      <header
        className={clsx(
          "flex justify-between pb-3 border-b border-neutral-700",
          "mb-3"
        )}
      >
        <ValidatorCard validator={validator} showAddress={false} />
        {validator.homepageUrl && (
          <a
            href={validator.homepageUrl}
            target="_blank"
            rel="nofollow noreferrer"
            className="flex items-center text-xs gap-1 hover:text-cyan"
          >
            Web <GoGlobe />
          </a>
        )}
      </header>
      <p>{shortenAddress(validator.address, 20, 8)}</p>
      {validator.description && (
        <p className="bg-neutral-700 px-2.5 py-3 mt-3 rounded-sm">
          {validator.description}
        </p>
      )}
      <dl
        className={clsx(
          "grid gap-y-1.5 grid-cols-2 justify-between mt-4 [&_dd]:text-right",
          "border-b border-neutral-700 pb-5"
        )}
      >
        <dt>Chain</dt>
        <dd>Namada</dd>
        <dt>Commission</dt>
        <dd>{formatPercentage(validator.commission)}</dd>
        <dt>Approximate APR (%)</dt>
        <dd>{formatPercentage(validator.expectedApr)}</dd>
        <dt>Voting Power</dt>
        <dd>
          {formatPercentage(
            new BigNumber(validator.votingPowerPercentage ?? 0)
          )}
        </dd>
        <dt>Unbonding Period</dt>
        <dd>{validator.unbondingPeriod}</dd>
      </dl>

      <i
        onClick={onClose}
        className="absolute text-xl top-2.5 right-3 cursor-pointer hover:text-cyan"
      >
        <IoClose />
      </i>
    </article>
  );
};
