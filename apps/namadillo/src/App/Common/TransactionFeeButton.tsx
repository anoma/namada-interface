import { TransactionFeeProps } from "hooks/useTransactionFee";
import { useState } from "react";
import { GasFeeModal } from "./GasFeeModal";
import { TransactionFee } from "./TransactionFee";

export const TransactionFeeButton = ({
  feeProps,
}: {
  feeProps: TransactionFeeProps;
}): JSX.Element => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="underline hover:text-yellow transition-all cursor-pointer"
        onClick={() => setModalOpen(true)}
      >
        <TransactionFee gasConfig={feeProps.gasConfig} />
      </button>
      {modalOpen && (
        <GasFeeModal feeProps={feeProps} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
};
