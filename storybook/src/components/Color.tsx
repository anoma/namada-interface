import clsx from "clsx";
import { twMerge } from "tailwind-merge";

type ColorProps = {
  className: string;
  rgb: string;
  textDark?: boolean;
  description?: string;
};

export const Color = ({
  className,
  rgb,
  textDark,
  description,
}: ColorProps): JSX.Element => {
  return (
    <div className="w-23">
      <i
        className={twMerge(
          "flex mx-auto items-center justify-center not-italic rounded-full h-23 w-23",
          className
        )}
      >
        <span
          className={clsx("font-medium", {
            "text-black": textDark,
            "text-white": !textDark,
          })}
        >
          {rgb}
        </span>
      </i>
      {description && (
        <small
          className={clsx(
            "w-full block leading-tight text-neutral-600 text-center mt-2 text-xs max-w-[90%] mx-auto"
          )}
        >
          {description}
        </small>
      )}
    </div>
  );
};
