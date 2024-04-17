import { AmountInput } from "@namada/components";
import { Tokens } from "@namada/types";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { useEffect, useRef } from "react";
import { Validator } from "slices/validators";

type ValidatorAmountControlProps = {
  inputId: string;
  validator: Validator;
  isSelected: boolean;
  onAmountChange: (validator: Validator, amount: BigNumber) => void;
  onAddValidator: (validator: Validator) => void;
  onRemoveValidator: (validator: Validator) => void;
  stakedAmount: BigNumber | undefined;
  newStakedAmount: BigNumber | undefined;
};

export const ValidatorAmountControl = ({
  inputId,
  validator,
  stakedAmount,
  isSelected,
  newStakedAmount,
  onAmountChange,
  onAddValidator,
  onRemoveValidator,
}: ValidatorAmountControlProps): JSX.Element => {
  const amountContainerRef = useRef<HTMLDivElement>(null);
  const wasSelected = useRef(stakedAmount !== undefined);

  useEffect(() => {
    if (isSelected && amountContainerRef.current && !wasSelected.current) {
      amountContainerRef.current.querySelector("input")?.focus();
      wasSelected.current = true;
    }

    if (!isSelected) {
      wasSelected.current = false;
    }
  }, [isSelected]);

  const handleAmountChange = (value: BigNumber | undefined): void => {
    if (value) {
      onAmountChange(validator, value);
    } else {
      onRemoveValidator(validator);
    }
  };

  console.log(">>>", stakedAmount);
  return (
    <div ref={amountContainerRef}>
      {(isSelected || !stakedAmount) && (
        <AmountInput
          id={inputId}
          className={clsx(
            "amountInput [&_input]:text-sm [&_input]:border-neutral-600",
            "[&_input]:py-2.5 [&_input]:rounded-sm",
            {
              "[&_input]:border-yellow": newStakedAmount,
            }
          )}
          value={newStakedAmount}
          placeholder="Select to enter stake"
          maxDecimalPlaces={Tokens.NAM.decimals}
          onChange={(e) => handleAmountChange(e.target.value)}
          onFocus={() => onAddValidator(validator)}
        />
      )}
    </div>
  );
};
