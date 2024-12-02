import { Asset } from "@chain-registry/types";
import { ActionButton } from "@namada/components";
import { TokenCurrency } from "App/Common/TokenCurrency";
import BigNumber from "bignumber.js";
import clsx from "clsx";

type AvailableAmountFooterProps = {
  availableAmount?: BigNumber;
  asset?: Asset;
  onClickMax?: () => void;
};

export const AvailableAmountFooter = ({
  availableAmount,
  asset,
  onClickMax,
}: AvailableAmountFooterProps): JSX.Element => {
  if (availableAmount === undefined || !asset) {
    return <></>;
  }

  return (
    <div
      className={clsx(
        "flex justify-between items-center text-sm text-neutral-500 font-light"
      )}
    >
      <span className="flex gap-2">
        Available:
        <TokenCurrency amount={availableAmount} symbol={asset.symbol} />
      </span>
      <span>
        {onClickMax && (
          <ActionButton
            type="button"
            size="xs"
            disabled={availableAmount.eq(0)}
            onClick={onClickMax}
            outlineColor="neutral"
            className="text-neutral-500 text-xs py-0 px-3"
            backgroundHoverColor="white"
            backgroundColor="transparent"
          >
            Max
          </ActionButton>
        )}
      </span>
    </div>
  );
};
