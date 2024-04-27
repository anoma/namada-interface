import { Currency, CurrencyProps } from "@namada/components";

type Props = Omit<
  CurrencyProps,
  "currency" | "currencyPosition" | "spaceAroundSign"
>;

export const NamCurrency = (props: Props): JSX.Element => {
  return (
    <Currency
      currency="nam"
      currencyPosition="right"
      spaceAroundSign={true}
      {...props}
    />
  );
};

export default NamCurrency;
