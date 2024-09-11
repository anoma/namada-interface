import { NamInput, NamInputProps } from "App/Common/NamInput";
import StakingRoutes from "App/Staking/routes";
import clsx from "clsx";
import { Link } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import { Validator } from "types";

export type AmountFieldProps = NamInputProps & {
  validator: Validator;
  hasStakedAmounts?: boolean;
  updated: boolean;
  displayCurrencyIndicator?: boolean;
  forceActive?: boolean;
};

export const AmountField = ({
  value,
  onChange,
  updated,
  validator,
  className,
  hasStakedAmounts,
  displayCurrencyIndicator = true,
  forceActive = false,
  ...inputProps
}: AmountFieldProps): JSX.Element => {
  const isActive =
    forceActive ||
    ["consensus", "belowCapacity", "belowThreshold"].includes(validator.status);
  const isJailed = !forceActive && validator.status === "jailed";
  const isInactive = !forceActive && validator.status === "inactive";

  return (
    <div className="relative">
      {(isActive || forceActive) && (
        <>
          <NamInput
            value={value}
            onChange={onChange}
            className={twMerge(
              clsx(
                "[&_input]:border-neutral-500 [&_input]:py-2.5 [&>div]:my-0",
                {
                  "[&_input]:border-yellow": updated,
                },
                className
              )
            )}
            {...inputProps}
          />
          {displayCurrencyIndicator && (
            <span className="absolute h-full flex items-center right-2 top-0 text-neutral-500 text-sm">
              NAM
            </span>
          )}
        </>
      )}

      <div className="opacity-50 text-sm text-center font-medium">
        {isJailed && !hasStakedAmounts && <p>Validator is jailed</p>}

        {isJailed && hasStakedAmounts && (
          <p>Validator is jailed. You have stopped receiving rewards</p>
        )}

        {isInactive && !hasStakedAmounts && <p>Validator is inactive</p>}

        {isInactive && hasStakedAmounts && (
          <p>
            Validator is inactive please{" "}
            <Link
              to={StakingRoutes.redelegateBonding().url}
              className="underline"
            >
              redelegate
            </Link>{" "}
            your stake
          </p>
        )}
      </div>
    </div>
  );
};
