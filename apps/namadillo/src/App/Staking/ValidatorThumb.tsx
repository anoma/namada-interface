import { ValidatorStatus } from "@anomaorg/namada-indexer-client";
import clsx from "clsx";
import { CiServer } from "react-icons/ci";
import { PiStackBold } from "react-icons/pi";
import { twMerge } from "tailwind-merge";

type ValidatorThumbProps = {
  className?: string;
  imageUrl?: string;
  alt: string;
  hasStake?: boolean;
  validatorStatus?: ValidatorStatus;
};

export const ValidatorThumb = ({
  className,
  imageUrl,
  alt,
  hasStake = false,
  validatorStatus,
}: ValidatorThumbProps): JSX.Element => {
  return (
    <span className="flex items-center justify-center relative w-8 aspect-square rounded-full bg-neutral-600/30">
      {imageUrl && (
        <img
          src={imageUrl}
          alt={alt}
          title={alt}
          className={twMerge("aspect-square w-8", className)}
        />
      )}
      {!imageUrl && (
        <span className="text-lg text-neutral-500">
          <CiServer />
        </span>
      )}
      {hasStake && (
        <i
          className={twMerge(
            clsx(
              "absolute -top-0.5 -right-1 rounded-full bg-cyan",
              "flex items-center justify-center text-black text-[10px] p-0.5",
              { "bg-fail": validatorStatus === "jailed" },
              { "bg-white": validatorStatus === "inactive" }
            )
          )}
        >
          <PiStackBold />
        </i>
      )}
    </span>
  );
};
