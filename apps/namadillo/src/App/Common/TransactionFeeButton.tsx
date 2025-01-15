import { useState } from "react";
import { GasConfig } from "types";
import { GasFeeModal } from "./GasFeeModal";
import { TransactionFee } from "./TransactionFee";

export const TransactionFeeButton = ({
  gasConfig,
}: {
  gasConfig: GasConfig;
}): JSX.Element => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="underline hover:text-yellow transition-all cursor-pointer"
        onClick={() => setModalOpen(true)}
      >
        <TransactionFee gasConfig={gasConfig} />
      </button>
      {modalOpen && (
        <GasFeeModal
          gasConfig={gasConfig}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
};
