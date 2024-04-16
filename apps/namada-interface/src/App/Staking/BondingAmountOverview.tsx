import { Currency, Panel, Stack } from "@namada/components";
import { CurrencyType } from "@namada/utils";
import BigNumber from "bignumber.js";

type BondingAmountOverviewProps = {
  title: string;
  amountInNam: BigNumber | number;
  amountInFiat?: BigNumber | number;
  selectedFiatCurrency: CurrencyType;
  additionalText?: React.ReactNode;
  extraContent?: React.ReactNode;
};

export const BondingAmountOverview = ({
  title,
  amountInNam,
  amountInFiat,
  selectedFiatCurrency,
  additionalText,
  extraContent,
}: BondingAmountOverviewProps): JSX.Element => {
  return (
    <Panel className="w-full rounded-md">
      <Stack gap={2} className="leading-none">
        <h3 className="text-sm">{title}</h3>
        <Currency
          className="text-4xl"
          currency="nam"
          amount={amountInNam}
          currencySignClassName="hidden"
        />
        {amountInFiat && (
          <Currency
            className="text-xl text-neutral-400"
            currency={selectedFiatCurrency}
            amount={amountInFiat}
          />
        )}
        {additionalText && <p className="text-[10px]">{additionalText}</p>}
        {extraContent}
      </Stack>
    </Panel>
  );
};
