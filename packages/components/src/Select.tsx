import clsx from "clsx";
import React from "react";
import { tv } from "tailwind-variants";

export type Option<T> = {
  value: T;
  label: string;
};

const selectClassList = tv({
  slots: {
    label: "text-xs text-[#8A8A8A] pl-5 pb-1",
    wrapper: "flex flex-col",
    select: clsx(
      "bg-[#1B1B1B] text-sm text-[#656565] border-transparent",
      "px-4 py-2 border-r-[12px] rounded-md"
    ),
  },
});

type Props<T = string | number> = {
  value: T;
  label?: string | JSX.Element;
  data: Option<T>[];
  style?: React.CSSProperties;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void | Promise<void>;
  className?: string;
  name: string;
};

function Select<T>({
  value,
  label = "",
  data,
  style,
  onChange,
  className,
  name,
}: Props<T>): JSX.Element {
  const classList = selectClassList();
  return (
    <div className={classList.wrapper()}>
      <label className={classList.label({ class: className })} htmlFor={name}>
        {label}
      </label>
      <select
        className={classList.select()}
        onChange={(event) => onChange?.(event)}
        value={`${value}`}
        style={style}
        name={name}
      >
        {data.map((option: Option<T>) => (
          <option key={`${option.value}`} value={`${option.value}`}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export { Select };
