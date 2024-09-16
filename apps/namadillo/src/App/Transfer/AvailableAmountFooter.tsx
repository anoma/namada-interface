import { Currency } from "@namada/components";
import { KnownCurrencies } from "@namada/utils";
import BigNumber from "bignumber.js";

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
    <div className="flex justify-between">
      <span className="flex gap-4">
        Available
        <Currency
          amount={availableAmount}
          currency={currency}
          currencyPosition="right"
        />
      </span>
      {onClickMax && (
        <button
          role="button"
          disabled={availableAmount.eq(0)}
          className="uppercase"
          onClick={onClickMax}
        >
          Max
        </button>
      )}
    </div>
  );
};
