import { chainAssetsMapAtom } from "atoms/chain/atoms";
import { TransactionFeeProps } from "hooks/useTransactionFee";
import { useAtomValue } from "jotai";
import { useMemo, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { twMerge } from "tailwind-merge";
import { getDisplayGasFee } from "utils/gas";
import { GasFeeModal } from "./GasFeeModal";
import { TransactionFee } from "./TransactionFee";

export const TransactionFeeButton = ({
  feeProps,
  className,
  isShieldedTransfer = false,
}: {
  feeProps: TransactionFeeProps;
  className?: string;
  isShieldedTransfer?: boolean;
}): JSX.Element => {
  const [modalOpen, setModalOpen] = useState(false);
  const chainAssetsMap = useAtomValue(chainAssetsMapAtom);
  const gasDisplayAmount = useMemo(() => {
    return getDisplayGasFee(feeProps.gasConfig, chainAssetsMap);
  }, [feeProps]);

  return (
    <>
      <div
        className={twMerge(
          "flex items-center justify-between gap-5 flex-1",
          className
        )}
      >
        <TransactionFee
          displayAmount={gasDisplayAmount.totalDisplayAmount}
          symbol={gasDisplayAmount.asset.symbol}
        />
        <div className="flex items-center gap-2">
          <div className="text-neutral-500 text-xs">Fee Options:</div>
          <button
            type="button"
            className={twMerge(
              "flex items-center gap-1",
              "border rounded-sm px-2 py-1 text-xs",
              "transition-all cursor-pointer hover:text-yellow"
            )}
            onClick={() => setModalOpen(true)}
          >
            <span className="text- font-medium">
              {gasDisplayAmount.asset.symbol}
            </span>
            <IoIosArrowDown />
          </button>
        </div>
      </div>
      {modalOpen && (
        <GasFeeModal
          feeProps={feeProps}
          onClose={() => setModalOpen(false)}
          isShielded={isShieldedTransfer}
        />
      )}
    </>
  );
};
