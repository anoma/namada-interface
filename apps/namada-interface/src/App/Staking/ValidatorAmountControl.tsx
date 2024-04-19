import { AmountInput, Currency } from "@namada/components";
import { Tokens } from "@namada/types";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { ReactNode, useEffect, useRef } from "react";
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
  const displayedAmount = newStakedAmount || stakedAmount;
  const hasStakedAmount = stakedAmount && stakedAmount.gt(0);
  const hasUpdatedAmount =
    newStakedAmount && !newStakedAmount.eq(stakedAmount || 0);

  const difference =
    hasUpdatedAmount && hasStakedAmount ?
      newStakedAmount.minus(stakedAmount)
    : new BigNumber(0);

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

  const placeholder =
    hasStakedAmount ? "Select to re-delegate" : "Select to enter stake";

  let hint: ReactNode = "";
  const differenceInNams = (
    <Currency
      currency="nam"
      amount={difference.abs()}
      currencyPosition="right"
      spaceAroundSign={true}
    />
  );

  if (difference.lt(0)) {
    hint = (
      <span className="text-yellow">
        -{differenceInNams} will be removed from this validator
      </span>
    );
  }

  if (hasStakedAmount && difference.gt(0)) {
    hint = (
      <span className="text-yellow">
        +{differenceInNams} will be delegated to this validator
      </span>
    );
  }

  return (
    <div ref={amountContainerRef}>
      <div className="relative w-full">
        {(isSelected || !stakedAmount) && (
          <AmountInput
            id={inputId}
            value={displayedAmount}
            placeholder={placeholder}
            maxDecimalPlaces={Tokens.NAM.decimals}
            onChange={(e) => handleAmountChange(e.target.value)}
            onFocus={() => onAddValidator(validator)}
            hint={hint}
            className={clsx(
              "amountInput [&_input]:text-sm [&_input]:border-neutral-600",
              "[&_input]:py-2.5 [&_input]:rounded-sm",
              {
                "[&_input]:border-yellow [&_input]:text-yellow [&_input]:bg-yellow-950":
                  hasUpdatedAmount,
              }
            )}
          />
        )}
        {hasStakedAmount && stakedAmount && newStakedAmount && (
          <span className="text-xs absolute right-2.5 top-3 text-neutral-500">
            /&nbsp;
            <Currency
              currency="nam"
              amount={stakedAmount}
              currencyPosition="right"
              spaceAroundSign={true}
            />
          </span>
        )}
      </div>
    </div>
  );
};
