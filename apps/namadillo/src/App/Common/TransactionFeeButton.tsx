import { chainAssetsMapAtom } from "atoms/chain";
import { TransactionFeeProps } from "hooks/useTransactionFee";
import { useAtomValue } from "jotai";
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
  const chainAssetsMap = useAtomValue(chainAssetsMapAtom);
  const gasDisplayAmount = useMemo(() => {
    return getDisplayGasFee(feeProps.gasConfig, chainAssetsMap);
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
