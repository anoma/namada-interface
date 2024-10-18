import { formatCurrency } from "@namada/utils";
import BigNumber from "bignumber.js";
import { ComponentProps } from "react";

export const FiatCurrency = ({
  amount,
  ...props
}: {
  amount?: BigNumber;
} & ComponentProps<"span">): JSX.Element => {
  return <span {...props}>{formatCurrency("USD", amount)}</span>;
};
