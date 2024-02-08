import BigNumber from "bignumber.js";
import { ChangeEventHandler, ComponentProps, useState } from "react";

import { Result } from "@namada/utils";

import { Input } from "./Input";

type BigNumberElement = Omit<HTMLInputElement, "value"> & {
  value?: BigNumber;
};

type Props = Omit<
  ComponentProps<typeof Input>,
  "value" | "onChange" | "min" | "max"
> & {
  value?: BigNumber;
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
  const [inputString, setInputString] = useState<string>();
  const [lastKnownValue, setLastKnownValue] = useState<BigNumber>();
  const [validationError, setValidationError] = useState<string>();

  const valueChanged =
    value === undefined || lastKnownValue === undefined
      ? value !== lastKnownValue
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

    const validateResult = validate(stringValue, {
      min,
      max,
      maxDecimalPlaces,
    });
    const asBigNumber = validateResult.ok ? validateResult.value : undefined;

    const error =
      validateResult.ok || stringValue === ""
        ? ""
        : errorMessages[validateResult.error];
    setValidationError(error);

    setLastKnownValue(asBigNumber);
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
