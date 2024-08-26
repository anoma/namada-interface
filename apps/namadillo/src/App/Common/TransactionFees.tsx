import clsx from "clsx";
import { GasConfig } from "types";
import { NamCurrency } from "./NamCurrency";
import { TextLink } from "./TextLink";

type TransactionFeesProps = {
  gasConfig: GasConfig;
  className?: string;
};

export const TransactionFees = ({
  gasConfig,
  className,
}: TransactionFeesProps): JSX.Element => {
  const fee = gasConfig.gasPrice.times(gasConfig.gasLimit);

  return (
    <div className={clsx("text-white text-sm", className)}>
      <TextLink>Transaction fee:</TextLink>{" "}
      <NamCurrency className="font-medium" amount={fee} />
    </div>
  );
};
