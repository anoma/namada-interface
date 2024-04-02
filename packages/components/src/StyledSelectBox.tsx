import clsx from "clsx";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

export type SelectBoxOption = {
  id: string;
  value: React.ReactNode;
  ariaLabel: string;
};

export type SelectBoxProps = {
  id: string;
  value: string;
  displayArrow?: boolean;
  listContainerProps?: React.ComponentPropsWithoutRef<"ul">;
  containerProps?: React.ComponentPropsWithoutRef<"div">;
  listItemProps?: React.ComponentPropsWithoutRef<"li">;
  defaultValue: React.ReactNode;
  options: SelectBoxOption[];
} & React.ComponentPropsWithRef<"input">;

export const StyledSelectBox = ({
  id,
  options,
  value,
  onChange,
  containerProps = {},
  listItemProps = {},
  listContainerProps = {},
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

  useEffect(() => {
    const close = (): void => setOpen(false);
    if (open) {
      document.documentElement.addEventListener("click", close);
    }
    return () => {
      document.documentElement.removeEventListener("click", close);
    };
  }, [open]);

  const getElementId = (optionId: string): string => `radio-${id}-${optionId}`;

  const { className: containerClassList, ...otherContainerProps } =
    containerProps;

  const { className: listContainerClassList, ...otherListContainerProps } =
    listContainerProps;

  const { className: listItemClassList, ...otherListItemProps } = listItemProps;

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
            "group inline-flex items-center relative select-none",
            "font-medium cursor-pointer pl-2 pr-3",
            clsx({
              "opacity-50": open,
            }),
            containerClassList
          )}
          role="button"
          aria-label="Open Navigation"
          onClick={() => setOpen(!open)}
          {...otherContainerProps}
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
            "hidden absolute top-[2.5em] left-1/2 -translate-x-1/2 flex-col hidden",
            "rounded-sm pt-2 pb-3 px-5 cursor-pointer bg-rblack",
            clsx({ flex: open }),
            listContainerClassList
          )}
          {...otherListContainerProps}
        >
          {options.map((option, idx) => (
            <li
              key={`selectbox-item-${id}-${option.id}`}
              className={twMerge(
                clsx("group/item cursor-pointer py-2", {
                  "border-b border-current": idx < options.length - 1,
                }),
                listItemClassList
              )}
              onClick={() => setOpen(false)}
              {...otherListItemProps}
            >
              <label
                className={twMerge(
                  "grid grid-cols-[30px_max-content] cursor-pointer",
                  "group-hover/item:text-cyan transition-color duration-150"
                )}
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
