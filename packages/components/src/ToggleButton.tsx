import clsx from "clsx";
import { tv } from "tailwind-variants";

type Props = {
  checked: boolean;
  onChange: () => void;
  label: string;
  theme?: "yellow" | "black";
};

const toggleButtonClassList = tv({
  slots: {
    container: clsx(
      "flex gap-6 items-center cursor-pointer text-sm",
      "[&>span]:relative active:[&>span]:top-px"
    ),
    checkbox: clsx("invisible absolute pointer-events-none"),
    toggleContainer: clsx(
      "group relative rounded-3xl bg-rblack p-1 h-5 w-10 cursor-pointer",
      "transition-all duration-100 ease-out-quad"
    ),
    toggleIndicator: clsx(
      "absolute left-0.5 top-0.5 h-[calc(100%-4px)] bg-yellow",
      "aspect-square rounded-full transition-all duration-300 ease-out-quad"
    ),
  },
  variants: {
    checked: {
      true: {
        toggleIndicator: "translate-x-5",
      },
    },
  },
});

export const ToggleButton = ({
  checked,
  onChange,
  label,
}: Props): JSX.Element => {
  const { container, checkbox, toggleContainer, toggleIndicator } =
    toggleButtonClassList({ checked });

  return (
    <label className={container()}>
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
