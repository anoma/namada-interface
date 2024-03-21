import clsx from "clsx";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

type SelectBoxOption = {
  id: string;
  value: React.ReactNode;
  ariaLabel: string;
};

type SelectBoxProps = {
  id: string;
  value: string;
  displayArrow?: boolean;
  listContainerClassList?: string;
  containerClassList?: string;
  listItemClassList?: string;
  defaultValue: React.ReactNode;
  options: SelectBoxOption[];
} & React.ComponentPropsWithRef<"input">;

export const StyledSelectBox = ({
  id,
  options,
  value,
  onChange,
  listItemClassList,
  containerClassList,
  listContainerClassList,
  displayArrow = true,
  defaultValue,
  ...props
}: SelectBoxProps): JSX.Element => {
  const [selected, setSelected] = useState<SelectBoxOption | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const defaultSelected = options.find((option) => option.id === value);
    if (defaultSelected) {
      setSelected(defaultSelected);
    }
  }, []);

  const getElementId = (optionId: string): string => `radio-${id}-${optionId}`;

  return (
    <div className="relative">
      <fieldset
        role="radiogroup"
        className="absolute pointer-events-none invisible"
      >
        {options.map((option: SelectBoxOption) => (
          <input
            key={`radio-${id}-${option.id}`}
            id={getElementId(option.id)}
            type="radio"
            value={option.id}
            checked={value === option.id}
            aria-label={option.ariaLabel}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSelected(option);
              if (onChange) onChange(e);
            }}
            {...props}
          />
        ))}
      </fieldset>
      <div>
        <div
          className={twMerge(
            "group inline-flex items-center relative font-medium cursor-pointer pl-2 pr-3",
            "transition-all duration-150",
            clsx({
              "opacity-50": open,
            }),
            containerClassList
          )}
          role="button"
          aria-label="Open Navigation"
          onClick={() => setOpen(!open)}
        >
          {selected ? selected.value : defaultValue}
          {displayArrow && (
            <i
              className={clsx(
                "absolute right-0 rotate-45 border-r border-b w-[5px] h-[5px] border-current",
                "origin-top",
                { "rotate-[-135deg] translate-y-[0.35em]": open }
              )}
            />
          )}
        </div>
        <ul
          className={twMerge(
            "hidden flex-col hidden py-2 px-2 cursor-pointer",
            clsx({ flex: open }),
            listContainerClassList
          )}
        >
          {options.map((option) => (
            <li
              className="cursor-pointer py-2 border-b border-rblack group"
              onClick={() => setOpen(false)}
              key={`radio-view-${option.id}-${value}`}
            >
              <label
                className={twMerge("flex cursor-pointer", listItemClassList)}
                htmlFor={getElementId(option.id)}
              >
                {option.value}
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
