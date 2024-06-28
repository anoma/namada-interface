import { Stack } from "@namada/components";
import { GoCheckCircle } from "react-icons/go";

import clsx from "clsx";
import { tv } from "tailwind-variants";

type TickedRadioListElement<T extends string> = {
  text: string;
  value: T;
};

type TickedRadioListProps<T extends string> = {
  options: Array<TickedRadioListElement<T>>;
  id: string;
  value: T | undefined;
  onChange: (value: string) => void;
};

const tickedRadioList = tv({
  slots: {
    fieldset: "flex flex-col",
    label: clsx(
      "w-full bg-black text-white text-base text-center rounded-sm py-3.5 px-5",
      "border border-black cursor-pointer font-medium flex items-center",
      "justify-center hover:text-yellow transition-colors relative"
    ),
    input: "hidden",
    icon: "absolute right-4 text-neutral-450 text-xl text-yellow",
  },
  variants: {
    checked: {
      true: {
        label: "border-yellow",
      },
    },
  },
});

export const TickedRadioList = <T extends string = string>({
  options,
  id,
  value,
  onChange,
}: TickedRadioListProps<T>): JSX.Element => {
  const { fieldset, label, input, icon } = tickedRadioList();

  return (
    <Stack as="fieldset" className={fieldset()} gap={3}>
      {options.map((option, idx) => {
        const checked = value === option.value;

        return (
          <label key={idx} className={label({ checked })}>
            {option.text}
            {checked && <GoCheckCircle strokeWidth={1} className={icon()} />}
            <input
              className={input()}
              type="radio"
              name={id}
              value={option.value}
              checked={checked}
              onChange={(e) => onChange(e.target.value)}
            ></input>
          </label>
        );
      })}
    </Stack>
  );
};
