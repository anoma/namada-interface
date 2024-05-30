import BigNumber from "bignumber.js";
import clsx from "clsx";
import { useMemo } from "react";
import { Validator } from "slices/validators";
import { ValidatorThumb } from "./ValidatorThumb";

type QuickAccessListProps = {
  updatedAmountByAddress: Record<string, BigNumber>;
  stakedAmountByAddress: Record<string, BigNumber>;
  validators: Validator[];
  onClick: (validator: Validator) => void;
};

export const QuickAccessList = ({
  validators,
  stakedAmountByAddress,
  updatedAmountByAddress,
  onClick,
}: QuickAccessListProps): JSX.Element => {
  const displayedValidators = useMemo(() => {
    const validatorAddresses = Object.keys(stakedAmountByAddress).concat(
      Object.keys(updatedAmountByAddress)
    );

    return validators
      .filter((validator: Validator) =>
        validatorAddresses.includes(validator.address)
      )
      .sort((v1, _v2) =>
        Object.keys(stakedAmountByAddress).includes(v1.address) ? -1 : 1
      );
  }, [stakedAmountByAddress, updatedAmountByAddress]); // My validators will never change

  return (
    <ul className="flex items-center whitespace-nowrap gap-1">
      {displayedValidators.map((validator: Validator) => (
        <li
          key={`quick-access-val-${validator.address}`}
          onClick={() => onClick(validator)}
        >
          <ValidatorThumb
            className={clsx(
              "w-10 transition-colors duration-150 ease-out-quad",
              "border-2 border-transparent cursor-pointer",
              {
                "border-yellow": Object.keys(updatedAmountByAddress).includes(
                  validator.address
                ),
              }
            )}
            hasStake={Object.keys(stakedAmountByAddress).includes(
              validator.address
            )}
            imageUrl={validator.imageUrl}
            alt={validator.alias || validator.address}
          />
        </li>
      ))}
    </ul>
  );
};
