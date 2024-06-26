import clsx from "clsx";
import { useAtomValue } from "jotai";
import { TxKind, gasLimitsAtom, minimumGasPriceAtom } from "slices/fees";
import { NamCurrency } from "./NamCurrency";
import { TextLink } from "./TextLink";

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

  if (!gasLimits.isSuccess || !gasPrice.isSuccess) return <></>;
  return (
    <div className={clsx("text-white text-sm", className)}>
      <TextLink>Transaction fee:</TextLink>{" "}
      <NamCurrency
        className="font-medium"
        forceBalanceDisplay={true}
        amount={gasLimits.data[txKind].native.multipliedBy(
          numberOfTransactions
        )}
      />
    </div>
  );
};
