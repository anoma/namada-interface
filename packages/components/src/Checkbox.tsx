import clsx from "clsx";
import { GoCheck } from "react-icons/go";
import { tv, type VariantProps } from "tailwind-variants";

const checkbox = tv({
  slots: {
    label: clsx(
      "group bg-gray rounded-sm border border-black cursor-pointer",
      "inline-flex h-7 relative w-7 active:top-px",
      "[&_svg]:w-full"
    ),
    checkbox: "absolute invisible",
    control: clsx(
      "inline-flex w-full items-center text-current justify-center",
      "opacity-0 text-xl transition-opacity duration-150 group-hover:opacity-50"
    ),
  },
  variants: {
    checked: {
      true: {
        control: "opacity-100",
        label: "bg-black border-yellow",
      },
      false: {
        label: "opacity-50",
      },
    },
  },
});

type CheckboxProps = React.ComponentPropsWithRef<"input"> &
  VariantProps<typeof checkbox>;

export const Checkbox = ({
  className,
  ...props
}: CheckboxProps): JSX.Element => {
  const checkboxClasses = checkbox({
    checked: props.checked,
  });

  return (
    <label className={checkboxClasses.label({ class: className })}>
      <input
        className={checkboxClasses.checkbox()}
        type="checkbox"
        {...props}
      />
      <i className={checkboxClasses.control()}>
        <GoCheck />
      </i>
    </label>
  );
};
