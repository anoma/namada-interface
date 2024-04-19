import { Currency, Panel, Stack } from "@namada/components";
import { CurrencyType } from "@namada/utils";
import BigNumber from "bignumber.js";
import clsx from "clsx";

type BondingAmountOverviewProps = {
  title: string;
  amountInNam: BigNumber | number;
  updatedAmountInNam?: BigNumber | number;
  amountToDelegate?: BigNumber;
  fiatExchangeRate: number;
  selectedFiatCurrency: CurrencyType;
  additionalText?: React.ReactNode;
  extraContent?: React.ReactNode;
};

export const BondingAmountOverview = ({
  title,
  amountInNam,
  updatedAmountInNam = 0,
  fiatExchangeRate,
  selectedFiatCurrency,
  additionalText,
  extraContent,
  amountToDelegate,
}: BondingAmountOverviewProps): JSX.Element => {
  const amountInFiat = new BigNumber(amountInNam).multipliedBy(
    fiatExchangeRate
  );

  const updatedAmountInFiat = new BigNumber(
    updatedAmountInNam || 0
  ).multipliedBy(fiatExchangeRate);

  const hasUpdatedValue =
    !new BigNumber(updatedAmountInNam).eq(0) &&
    !new BigNumber(updatedAmountInNam).eq(amountInNam);
  const namToDisplay = hasUpdatedValue ? updatedAmountInNam : amountInNam;
  const fiatToDisplay = hasUpdatedValue ? updatedAmountInFiat : amountInFiat;
  console.log(hasUpdatedValue, namToDisplay, amountInNam);

  return (
    <Panel className="w-full rounded-md">
      <Stack gap={2} className="leading-none">
        <h3 className="text-sm">{title}</h3>
        <div className="flex items-center">
          <Currency
            className={clsx("text-4xl", {
              "text-yellow": hasUpdatedValue,
            })}
            currency="nam"
            amount={namToDisplay}
            currencySignClassName="hidden"
          />
          {amountToDelegate && amountToDelegate.gt(0) && (
            <span className="text-success text-lg font-light mt-1.5 ml-3">
              (+
              <Currency
                currency="nam"
                currencySignClassName="hidden"
                amount={amountToDelegate}
              />{" "}
              Re-Delegate)
            </span>
          )}
        </div>
        <Currency
          className="text-xl text-neutral-400"
          amount={fiatToDisplay}
          currency={selectedFiatCurrency}
        />
        {additionalText && <p className="text-[10px]">{additionalText}</p>}
        {extraContent}
      </Stack>
    </Panel>
  );
};
