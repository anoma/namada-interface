import BigNumber from "bignumber.js";
import { ChangeEventHandler, useState } from "react";

import { Result } from "@namada/utils";

import { Input, InputProps } from "./Input";

export type BigNumberElement = Omit<HTMLInputElement, "value"> & {
  value?: BigNumber | undefined;
};

type Props = Omit<InputProps, "value" | "onChange" | "min" | "max"> & {
  value?: BigNumber | undefined;
  onChange?: ChangeEventHandler<BigNumberElement>;
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
): Result<BigNumber, ValidationError> => {
  const { min, max, maxDecimalPlaces } = props;
  const asBigNumber = new BigNumber(stringValue);

  if (asBigNumber.isNaN()) {
    return Result.err("NotANumber");
  }

  const decimalPlaces = asBigNumber.decimalPlaces();

  if (decimalPlaces === null) {
    return Result.err("NotANumber");
  } else if (
    maxDecimalPlaces !== undefined &&
    decimalPlaces > maxDecimalPlaces
  ) {
    return Result.err("TooManyDecimalPlaces");
  } else if (min !== undefined && asBigNumber.isLessThan(min)) {
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
  const [inputString, setInputString] = useState<string | undefined>();
  const [lastKnownValue, setLastKnownValue] = useState<BigNumber>();
  const [validationError, setValidationError] = useState<string>();

  const valueChanged =
    value === undefined || lastKnownValue === undefined ?
      value !== lastKnownValue
    : !value.isEqualTo(lastKnownValue);

  if (valueChanged) {
    setLastKnownValue(value);
    setInputString(value?.toString());
  }

  const errorMessages: Record<ValidationError, string> = {
    NotANumber: "Not a number",
    TooSmall: `Amount is lower than the minimum (${min})`,
    TooBig: `Amount is higher than the maximum (${max})`,
    TooManyDecimalPlaces: `Maximum decimal places is ${maxDecimalPlaces}`,
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const stringValue = event.target.value;
    setInputString(stringValue);

    if (stringValue === undefined || stringValue === "") {
      onChange?.({
        ...event,
        target: { ...event.target, value: undefined },
        currentTarget: { ...event.currentTarget, value: undefined },
      });
      return;
    }

    const validateResult = validate(stringValue, {
      min,
      max,
      maxDecimalPlaces,
    });
    const asBigNumber = validateResult.ok ? validateResult.value : undefined;

    const error =
      validateResult.ok || stringValue === "" ?
        ""
      : errorMessages[validateResult.error];
    setValidationError(error);
    setLastKnownValue(asBigNumber);
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
