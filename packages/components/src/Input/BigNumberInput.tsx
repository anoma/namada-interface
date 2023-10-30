import BigNumber from "bignumber.js";
import { ChangeEvent, ComponentProps, useState } from "react";
import {
  ErrorTooltip,
  InputWrapper,
  Label,
  TextInput,
} from "./input.components";

type BigNumberElement = Omit<HTMLInputElement, "value"> & {
  value?: BigNumber
}

type BigNumberInputProps =
  Omit<ComponentProps<typeof TextInput>, "value" | "onChange"> & {
    value?: BigNumber;
    onChange: (event: ChangeEvent<BigNumberElement>) => void;
    label?: string;
    error?: string;
  };

export const BigNumberInput: React.FC<BigNumberInputProps> = ({
  value,
  onChange,
  label,
  error,
  ...rest
}) => {
  const [inputString, setInputString] = useState<string>();
  const [lastKnownValue, setLastKnownValue] = useState<BigNumber>();

  if (value !== lastKnownValue) {
    setLastKnownValue(value);
    setInputString(value?.toString());
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const stringValue = event.target.value;

    setInputString(stringValue);

    const asBigNumber = stringValue
      ? new BigNumber(stringValue)
      : undefined;

    if (!asBigNumber || !asBigNumber.isNaN()) {
      setLastKnownValue(asBigNumber);
      onChange?.({
        ...event,
        target: { ...event.target, value: asBigNumber },
        currentTarget: { ...event.target, value: asBigNumber }
      });
    }
  }

  return (
    <Label>
      {label}
      <InputWrapper>
        <TextInput
          value={inputString}
          onChange={handleChange}
          error={!!error}
          {...rest}
        />
        <br />
      </InputWrapper>
      <ErrorTooltip>{error}</ErrorTooltip>
    </Label>
  );
};
