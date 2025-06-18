import { Asset } from "@chain-registry/types";
import { TokenCurrency } from "App/Common/TokenCurrency";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { useEffect, useMemo, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

type AvailableAmountFooterProps = {
  amount?: BigNumber;
  availableAmount?: BigNumber;
  availableAmountMinusFees?: BigNumber;
  asset?: Asset;
  onChangeAmount?: (amount?: BigNumber) => void;
};

const useBigNumberMemo = (number?: BigNumber): BigNumber | undefined => {
  const ref = useRef(number);
  ref.current = number;

  // TODO improve this
  return useMemo(() => {
    return ref.current;
  }, [ref.current?.toString()]);
};

export const AvailableAmountFooter = ({
  amount: amount2,
  availableAmount,
  availableAmountMinusFees: availableAmountMinusFees2,
  asset,
  onChangeAmount,
}: AvailableAmountFooterProps): JSX.Element => {
  const [isMaxEnabled, setIsMaxEnabled] = useState(false);

  const amount = useBigNumberMemo(amount2);
  const availableAmountMinusFees = useBigNumberMemo(availableAmountMinusFees2);

  useEffect(() => {
    if (
      isMaxEnabled &&
      amount &&
      availableAmountMinusFees &&
      !amount.isEqualTo(availableAmountMinusFees)
    ) {
      setIsMaxEnabled(false);
    }
  }, [amount]);

  useEffect(() => {
    if (isMaxEnabled) {
      onChangeAmount?.(availableAmountMinusFees);
    }
  }, [isMaxEnabled, availableAmountMinusFees]);

  if (availableAmountMinusFees === undefined || !asset) {
    return <></>;
  }

  const isInsufficientBalance = availableAmountMinusFees.eq(0);

  return (
    <div
      className={clsx(
        "flex justify-between items-center text-sm text-neutral-500 font-light"
      )}
    >
      <div>
        <div>
          Available:{" "}
          <TokenCurrency
            amount={availableAmountMinusFees}
            symbol={asset.symbol}
          />
        </div>
        {isInsufficientBalance && (
          <div className="text-fail">
            <div>Insufficient balance to cover the fee</div>
            {availableAmount && (
              <div>
                Balance:{" "}
                <TokenCurrency amount={availableAmount} symbol={asset.symbol} />
              </div>
            )}
          </div>
        )}
      </div>
      <div>
        {onChangeAmount && (
          <button
            type="button"
            className={twMerge(
              "border rounded-sm py-0 px-3 h-6 text-xs font-medium",
              "transition-all duration-300 cursor-pointer",
              isMaxEnabled ?
                "bg-white text-black"
              : "text-neutral-500 hover:text-white"
            )}
            onClick={() => setIsMaxEnabled((v) => !v)}
          >
            Max
          </button>
        )}
      </div>
    </div>
  );
};
