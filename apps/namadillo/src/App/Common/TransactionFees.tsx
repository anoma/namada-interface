import clsx from "clsx";
import { useGasEstimate } from "hooks/useGasEstimate";
import { useState } from "react";
import { GasUsageModal } from "./GasUsageModal";
import { NamCurrency } from "./NamCurrency";

type TransactionFeesProps = {
  numberOfTransactions: number;
  className?: string;
};

export const TransactionFees = ({
  numberOfTransactions,
  className,
}: TransactionFeesProps): JSX.Element => {
  const [modalOpen, setModalOpen] = useState(false);
  const { calculateMinGasRequired } = useGasEstimate();
  const minimumGas = calculateMinGasRequired(numberOfTransactions);

  if (!minimumGas || minimumGas.eq(0)) return <></>;
  return (
    <>
      <div
        className={clsx("text-white text-sm", className)}
        onClick={() => setModalOpen(true)}
      >
        <span className="underline cursor-pointer">Transaction fee:</span>{" "}
        <NamCurrency
          className="font-medium"
          amount={minimumGas}
          forceBalanceDisplay={true}
        />
      </div>
      {modalOpen && <GasUsageModal onClose={() => setModalOpen(false)} />}
    </>
  );
};
