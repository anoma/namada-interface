import { Currency, CurrencyProps } from "@namada/components";
import { useAtomValue } from "jotai";
import { hideBalancesAtom } from "slices/settings";

type NamCurrencyProps = Omit<
  CurrencyProps,
  "currency" | "currencyPosition" | "spaceAroundSign"
> & { forceBalanceDisplay?: boolean };

export const NamCurrency = ({
  forceBalanceDisplay = false,
  ...props
}: NamCurrencyProps): JSX.Element => {
  const hideBalances = useAtomValue(hideBalancesAtom);
  return (
    <Currency
      currency="nam"
      currencyPosition="right"
      spaceAroundSign={true}
      hideBalances={hideBalances && !forceBalanceDisplay}
      {...props}
    />
  );
};
