import clsx from "clsx";
import { useState } from "react";
import { BurgerButton } from "./BurgerButton";

type ContainerProps = {
  header: JSX.Element;
  navigation: JSX.Element;
  children: JSX.Element;
} & React.ComponentPropsWithoutRef<"div">;

export const Container = ({
  header,
  navigation,
  children,
  ...props
}: ContainerProps): JSX.Element => {
  const [displayNavigation, setDisplayNavigation] = useState(false);

  return (
    <div className="max-w-[1920px] px-6 mx-auto pb-2" {...props}>
      <header className="flex justify-between font-medium pt-4 pb-5 pl-4">
        <div className="flex items-center gap-8">
          <span className="xl:hidden">
            <BurgerButton
              open={displayNavigation}
              onClick={() => setDisplayNavigation(!displayNavigation)}
            />
          </span>
          <i
            className={clsx(
              "flex items-center gap-4 text-yellow text-xl not-italic uppercase"
            )}
          >
            <i className="w-[42px] aspect-square inline-flex rounded-full border-[5px] border-yellow" />
            Namadillo
          </i>
        </div>
        <div className="flex gap-8 items-center">{header}</div>
      </header>
      <div
        className={clsx(
          "xl:grid xl:grid-cols-[220px_auto] xl:gap-2 min-h-[calc(100svh-95px)]"
        )}
      >
        <aside
          onClick={(e) => e.stopPropagation()}
          className={clsx(
            "transition-transform duration-500 ease-out-expo",
            "pt-10 bg-black rounded-sm fixed top-0 z-[9999] w-[240px]",
            "h-[calc(100svh-95px)] left-0 xl:z-0 xl:transition-none xl:pt-0 xl:w-auto xl:relative",
            { "-translate-x-full xl:translate-x-0": !displayNavigation }
          )}
        >
          {navigation}
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
};
