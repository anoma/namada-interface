import BigNumber from "bignumber.js";
import { ChangeEventHandler, useEffect, useState } from "react";

import { Result } from "@namada/utils";

import { Input, InputProps } from "./Input";

export type BigNumberElement = Omit<HTMLInputElement, "value"> & {
  value?: BigNumber;
};

export type ChangeAmountEvent = ChangeEventHandler<BigNumberElement>;

type Props = Omit<InputProps, "value" | "onChange" | "min" | "max"> & {
  value?: BigNumber;
  onChange?: ChangeAmountEvent;
  maxDecimalPlaces?: number;
  min?: string | number | BigNumber;
  max?: string | number | BigNumber;
};

type ValidationError =
  | "NotANumber"
  | "TooSmall"
  | "TooBig"
  | "TooManyDecimalPlaces";

const validate = (
  stringValue: string,
  props: Pick<Props, "min" | "max" | "maxDecimalPlaces">
): Result<BigNumber | undefined, ValidationError> => {
  if (stringValue === "") {
    return Result.ok(undefined);
  }

  const { min, max, maxDecimalPlaces } = props;
  const asBigNumber = new BigNumber(stringValue);

  if (asBigNumber.isNaN()) {
    return Result.err("NotANumber");
  }

  // Test for too many decimal places against the input string and not the
  // BigNumber in order to catch too many zeroes e.g. "12.00000000000000"
  const tooManyDecimalPlaces =
    typeof maxDecimalPlaces === "undefined" ? false : (
      new RegExp(`\\..{${maxDecimalPlaces + 1},}$`).test(stringValue)
    );

  if (tooManyDecimalPlaces) {
    return Result.err("TooManyDecimalPlaces");
  }

  if (min !== undefined && asBigNumber.isLessThan(min)) {
    return Result.err("TooSmall");
  } else if (max !== undefined && asBigNumber.isGreaterThan(max)) {
    return Result.err("TooBig");
  } else {
    return Result.ok(asBigNumber);
  }
};

export const AmountInput: React.FC<Props> = ({
  value,
  onChange,
  maxDecimalPlaces,
  min = 0,
  max,
  error,
  ...rest
}) => {
  const [inputString, setInputString] = useState<string>("");
  const [lastKnownValue, setLastKnownValue] = useState<BigNumber>();
  const [validationError, setValidationError] = useState<string>("");

  useEffect(() => {
    // This check ensures we don't overwrite the user's input string.
    // Otherwise, typing "12.0" would render "12", for example.
    const valueChanged =
      value === undefined || lastKnownValue === undefined ?
        value !== lastKnownValue
      : !value.isEqualTo(lastKnownValue);

    if (valueChanged) {
      setLastKnownValue(value);
      setInputString(typeof value === "undefined" ? "" : value.toString());
    }
  }, [value]);

  const errorMessages: Record<ValidationError, string> = {
    NotANumber: "Not a number",
    TooSmall: `Amount is lower than the minimum (${min})`,
    TooBig: `Amount is higher than the maximum (${max})`,
    TooManyDecimalPlaces: `Maximum decimal places is ${maxDecimalPlaces}`,
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const stringValue = event.target.value;
    setInputString(stringValue);

    const validateResult = validate(stringValue, {
      min,
      max,
      maxDecimalPlaces,
    });

    const asBigNumber = validateResult.ok ? validateResult.value : undefined;
    setLastKnownValue(asBigNumber);

    const error = validateResult.ok ? "" : errorMessages[validateResult.error];
    setValidationError(error);
    event.currentTarget.setCustomValidity(error);

    onChange?.({
      ...event,
      target: { ...event.target, value: asBigNumber },
      currentTarget: { ...event.currentTarget, value: asBigNumber },
    });
  };

  return (
    <Input
      variant="Text"
      value={inputString}
      onChange={handleChange}
      error={error || validationError}
      {...rest}
    />
  );
};
