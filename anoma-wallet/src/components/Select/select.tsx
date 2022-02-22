import React from "react";
import { StyledSelect } from "./select.components";

type Option<T> = {
  value: T;
  label: string;
};

type Props<T = string | number> = {
  value: T;
  data: Option<T>[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void | Promise<void>;
};

function Select<T>({ value, data, onChange }: Props<T>): JSX.Element {
  return (
    <StyledSelect onChange={onChange} value={`${value}`}>
      {data.map((option: Option<T>) => (
        <option key={`${option.value}`} value={`${option.value}`}>
          {option.label}
        </option>
      ))}
    </StyledSelect>
  );
}

export default Select;
