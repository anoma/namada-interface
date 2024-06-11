import clsx from "clsx";
import { PiStackBold } from "react-icons/pi";
import { twMerge } from "tailwind-merge";

type ValidatorThumbProps = {
  className?: string;
  imageUrl?: string;
  alt: string;
  hasStake?: boolean;
};

export const ValidatorThumb = ({
  className,
  imageUrl,
  alt,
  hasStake = false,
}: ValidatorThumbProps): JSX.Element => {
  return (
    <span className="flex relative w-8 aspect-square rounded-full bg-neutral-600/30">
      {imageUrl && (
        <img
          src={imageUrl}
          alt={alt}
          title={alt}
          className={twMerge("aspect-square w-8", className)}
        />
      )}
      {hasStake && (
        <i
          className={clsx(
            "absolute -top-0.5 -right-1 rounded-full bg-yellow",
            "flex items-center justify-center text-black text-[10px] p-0.5"
          )}
        >
          <PiStackBold />
        </i>
      )}
    </span>
  );
};
