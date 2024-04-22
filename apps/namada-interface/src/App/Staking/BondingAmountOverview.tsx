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
  updatedValueClassList?: string;
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
  updatedValueClassList = "",
}: BondingAmountOverviewProps): JSX.Element => {
  const amountInFiat = new BigNumber(amountInNam).multipliedBy(
    fiatExchangeRate
  );

  const updatedAmountInFiat = new BigNumber(
    updatedAmountInNam || 0
  ).multipliedBy(fiatExchangeRate);

  const hasUpdatedValue =
    updatedAmountInNam && !new BigNumber(updatedAmountInNam).eq(amountInNam);

  const namToDisplay = hasUpdatedValue ? updatedAmountInNam : amountInNam;
  const fiatToDisplay = hasUpdatedValue ? updatedAmountInFiat : amountInFiat;

  return (
    <Panel className="relative w-full rounded-md">
      <Stack gap={2} className="leading-none">
        <h3 className="text-sm">{title}</h3>
        <div className="flex items-center">
          <Currency
            className={clsx("text-2xl", {
              [updatedValueClassList]: hasUpdatedValue,
            })}
            currency="nam"
            amount={namToDisplay}
            spaceAroundSign={true}
            currencyPosition="right"
            currencySignClassName="text-lg"
          />
          {amountToDelegate && amountToDelegate.gt(0) && (
            <span className="text-success text-md font-light mt-1.5 ml-3">
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
          className="text-base text-neutral-400"
          amount={fiatToDisplay}
          currency={selectedFiatCurrency}
        />
        {additionalText && <p className="text-[10px]">{additionalText}</p>}
        {extraContent}
      </Stack>
    </Panel>
  );
};
