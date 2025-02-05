import { TransactionFeeProps } from "hooks/useTransactionFee";
import { useMemo, useState } from "react";
import { getDisplayGasFee } from "utils/gas";
import { GasFeeModal } from "./GasFeeModal";
import { TransactionFee } from "./TransactionFee";

export const TransactionFeeButton = ({
  feeProps,
}: {
  feeProps: TransactionFeeProps;
}): JSX.Element => {
  const [modalOpen, setModalOpen] = useState(false);

  const gasDisplayAmount = useMemo(() => {
    return getDisplayGasFee(feeProps.gasConfig);
  }, [feeProps]);

  return (
    <>
      <button
        type="button"
        className="underline hover:text-yellow transition-all cursor-pointer"
        onClick={() => setModalOpen(true)}
      >
        <TransactionFee
          displayAmount={gasDisplayAmount.totalDisplayAmount}
          symbol={gasDisplayAmount.asset.symbol}
        />
      </button>
      {modalOpen && (
        <GasFeeModal feeProps={feeProps} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
};
