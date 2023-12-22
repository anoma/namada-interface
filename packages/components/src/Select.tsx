import clsx from "clsx";
import React from "react";
import { GoArrowDown } from "react-icons/go";
import { tv } from "tailwind-variants";

export type Option<T> = {
  value: T;
  label: string;
};

const selectClassList = tv({
  slots: {
    label: "text-sm font-medium text-neutral-300 w-full [&_p]:pb-1",
    wrapper: "relative flex justify-end items-center w-full py-3 text-yellow",
    select: clsx(
      "unset w-full py-[0.875em] px-[1em] rounded-lg absolute left-0 bg-neutral-800",
      "h-12 mt-2 pr-2 pl-4 cursor-pointer"
    ),
  },
});

type Props<T = string | number> = {
  value: T;
  label?: string | JSX.Element;
  data: Option<T>[];
  style?: React.CSSProperties;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void | Promise<void>;
  className?: string;
};

function Select<T>({
  value,
  label = "",
  data,
  style,
  onChange,
  className,
}: Props<T>): JSX.Element {
  const classList = selectClassList();
  return (
    <label className={classList.label({ class: className })}>
      {label}
      <div className={classList.wrapper()}>
        <select
          className={classList.select()}
          onChange={onChange}
          value={`${value}`}
          style={style}
        >
          {data.map((option: Option<T>) => (
            <option key={`${option.value}`} value={`${option.value}`}>
              {option.label}
            </option>
          ))}
        </select>
        <i className="text-[20px] text-yellow">
          <GoArrowDown />
        </i>
      </div>
    </label>
  );
}

export { Select };
