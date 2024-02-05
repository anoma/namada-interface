import clsx from "clsx";

type Props = {
  checked: boolean;
  onChange: () => void;
  label: string;
};

export const ToggleButton = ({
  checked,
  onChange,
  label,
}: Props): JSX.Element => {
  return (
    <div
      className={clsx(
        "group relative rounded-3xl p-1 h-5 w-10 cursor-pointer",
        "transition-all duration-150 ease-out-quad",
        { "bg-yellow": checked, "bg-neutral-950": !checked }
      )}
      data-role="button"
      aria-label={label}
      role="switch"
      onClick={onChange}
    >
      <i
        className={clsx(
          "absolute left-1.5 top-0.5  h-[calc(100%-4px)]",
          "aspect-square rounded-full transition-all duration-300 ease-out-quad",
          "group-hover:bg-v-hover",
          { "translate-x-full": checked },
          { "bg-neutral-950": checked, "bg-neutral-800": !checked }
        )}
      />
    </div>
  );
};
