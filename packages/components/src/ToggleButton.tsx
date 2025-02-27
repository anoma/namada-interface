import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { VariantProps, tv } from "tailwind-variants";

const toggleButtonClassList = tv({
  slots: {
    container: clsx(
      "group flex gap-6 items-center cursor-pointer text-sm relative",
      "[&>span]:relative active:[&>span]:top-px"
    ),
    checkbox: clsx("invisible absolute pointer-events-none"),
    toggleContainer: clsx(
      "relative rounded-3xl p-1 h-5 w-10 cursor-pointer",
      "transition-all duration-100 ease-out-quad",
      "[&~span]:top-px"
    ),
    toggleIndicator: clsx(
      "absolute left-0.5 top-0.5 h-[calc(100%-4px)]",
      "aspect-square rounded-full transition-all duration-200 ease-out-quad"
    ),
  },
  variants: {
    color: {
      yellow: {
        toggleContainer: "bg-black",
        toggleIndicator: "bg-yellow",
      },
      white: {
        toggleContainer: "bg-neutral-700",
        toggleIndicator: "bg-white",
      },
    },
    activeColor: {
      yellow: {},
    },
    checked: {
      true: {
        toggleIndicator: "translate-x-5",
      },
    },
  },
  compoundVariants: [
    {
      checked: true,
      activeColor: "yellow",
      class: {
        toggleIndicator: "bg-black",
        toggleContainer: "bg-yellow",
      },
    },
  ],
});

type ToggleButtonProps = {
  onChange: () => void;
  label: string;
  containerProps?: React.ComponentPropsWithoutRef<"label">;
} & VariantProps<typeof toggleButtonClassList>;

export const ToggleButton = ({
  checked,
  onChange,
  label,
  color = "yellow",
  activeColor,
  containerProps = {},
}: ToggleButtonProps): JSX.Element => {
  const { container, checkbox, toggleContainer, toggleIndicator } =
    toggleButtonClassList({ checked, color, activeColor });

  const { className: containerClassName, ...containerPropsRest } =
    containerProps;

  return (
    <label
      className={twMerge(container(), containerClassName)}
      {...containerPropsRest}
    >
      <span>{label}</span>
      <input
        aria-label={label}
        type="checkbox"
        className={checkbox()}
        onChange={onChange}
        checked={checked}
      />
      <div className={clsx(toggleContainer())} data-role="button">
        <i className={toggleIndicator()} />
      </div>
    </label>
  );
};
