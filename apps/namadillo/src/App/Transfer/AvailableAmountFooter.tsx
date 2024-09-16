import { ActionButton, Currency } from "@namada/components";
import { KnownCurrencies } from "@namada/utils";
import BigNumber from "bignumber.js";
import clsx from "clsx";

type AvailableAmountFooterProps = {
  availableAmount?: BigNumber;
  currency?: keyof typeof KnownCurrencies;
  onClickMax?: () => void;
};

export const AvailableAmountFooter = ({
  availableAmount,
  currency,
  onClickMax,
}: AvailableAmountFooterProps): JSX.Element => {
  if (!currency || availableAmount === undefined) {
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
        <Currency
          amount={availableAmount}
          currency={currency}
          spaceAroundSign={true}
          currencyPosition="right"
        />
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
