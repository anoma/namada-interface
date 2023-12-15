import { Icon } from "@namada/components";
import clsx from "clsx";
import { tv, type VariantProps } from "tailwind-variants";

const checkbox = tv({
  slots: {
    label: clsx(
      "group bg-black rounded-sm border border-current cursor-pointer",
      "inline-flex h-6 p-0.5 relative w-6 active:top-px",
      "[&_svg]:w-full"
    ),
    checkbox: "absolute invisible",
    control: clsx(
      "inline-flex w-full items-center text-current justify-center",
      "opacity-0 transition-opacity duration-150 group-hover:opacity-50"
    ),
  },
  variants: {
    checked: {
      true: {
        control: "opacity-100",
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
        <Icon name="Checked" size="full" />
      </i>
    </label>
  );
};
