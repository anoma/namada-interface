import { gasLimitsAtom, minimumGasPriceAtom } from "atoms/fees";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { TxKind } from "types";
import { FeeWarning } from "./FeeWarning";
import { NamCurrency } from "./NamCurrency";

type TransactionFeesProps = {
  txKind: TxKind;
  numberOfTransactions: number;
  displayWarning?: boolean;
  className?: string;
};

export const TransactionFees = ({
  txKind,
  numberOfTransactions,
  displayWarning,
  className,
}: TransactionFeesProps): JSX.Element => {
  const gasLimits = useAtomValue(gasLimitsAtom);
  const gasPrice = useAtomValue(minimumGasPriceAtom);

  if (!gasLimits.isSuccess || !gasPrice.isSuccess || numberOfTransactions === 0)
    return <></>;

  return (
    <div className={clsx("flex flex-col", className)}>
      <div className="text-white text-sm">
        Transaction fee:{" "}
        <NamCurrency
          className="font-medium"
          forceBalanceDisplay={true}
          amount={gasPrice.data.multipliedBy(
            gasLimits.data[txKind].native.multipliedBy(numberOfTransactions)
          )}
        />
      </div>
      {displayWarning && <FeeWarning />}
    </div>
  );
};
