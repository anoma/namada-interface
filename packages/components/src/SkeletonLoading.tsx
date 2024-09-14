import React from "react";
import { twMerge } from "tailwind-merge";

type SkeletonLoadingProps = {
  height: string;
  width: string;
} & React.ComponentPropsWithoutRef<"span">;

export const SkeletonLoading = ({
  height,
  width,
  ...props
}: SkeletonLoadingProps): JSX.Element => {
  const { className, ...rest } = props;
  return (
    <span
      role="progressbar"
      className={twMerge(
        "bg-neutral-800 animate-pulse block rounded-[2px]",
        className
      )}
      style={{ width, height }}
      {...rest}
    />
  );
};
