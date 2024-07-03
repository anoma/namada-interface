import { gasLimitsAtom, minimumGasPriceAtom } from "atoms/fees";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { TxKind } from "types";
import { NamCurrency } from "./NamCurrency";

type TransactionFeesProps = {
  txKind: TxKind;
  numberOfTransactions: number;
  className?: string;
};

export const TransactionFees = ({
  txKind,
  numberOfTransactions,
  className,
}: TransactionFeesProps): JSX.Element => {
  const gasLimits = useAtomValue(gasLimitsAtom);
  const gasPrice = useAtomValue(minimumGasPriceAtom);

  if (!gasLimits.isSuccess || !gasPrice.isSuccess || numberOfTransactions === 0)
    return <></>;

  return (
    <div className={clsx("text-white text-sm", className)}>
      Transaction fee:{" "}
      <NamCurrency
        className="font-medium"
        forceBalanceDisplay={true}
        amount={gasPrice.data.multipliedBy(
          gasLimits.data[txKind].native.multipliedBy(numberOfTransactions)
        )}
      />
    </div>
  );
};
