import clsx from "clsx";

export const PageLoader = (): JSX.Element => {
  return (
    <div className={clsx("fixed left-0 top-0 w-svw h-svh z-10")}>
      <i
        className={clsx(
          "absolute w-8 h-8 top-0 left-0 right-0 bottom-0 m-auto border-4",
          "border-transparent border-t-yellow rounded-[50%]",
          "animate-loadingSpinner"
        )}
      />
    </div>
  );
};
