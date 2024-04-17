import { Currency, Panel, Stack } from "@namada/components";
import { CurrencyType } from "@namada/utils";
import BigNumber from "bignumber.js";

type BondingAmountOverviewProps = {
  title: string;
  amountInNam: BigNumber | number;
  updatedAmountInNam?: BigNumber | number;
  fiatExchangeRate: number;
  amountInFiat?: BigNumber | number;
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
}: BondingAmountOverviewProps): JSX.Element => {
  const amountInFiat = new BigNumber(amountInNam).multipliedBy(
    fiatExchangeRate
  );

  const updatedAmountInFiat = new BigNumber(
    updatedAmountInNam || 0
  ).multipliedBy(fiatExchangeRate);

  const hasUpdatedValue = !updatedAmountInFiat.eq(0);
  const namToDisplay = hasUpdatedValue ? updatedAmountInNam : amountInNam;
  const fiatToDisplay = hasUpdatedValue ? updatedAmountInFiat : amountInFiat;

  return (
    <Panel className="w-full rounded-md">
      <Stack gap={2} className="leading-none">
        <h3 className="text-sm">{title}</h3>
        <Currency
          className="text-4xl"
          currency="nam"
          amount={namToDisplay}
          currencySignClassName="hidden"
        />
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
