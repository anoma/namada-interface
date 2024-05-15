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
    <div className="max-w-[1920px] px-6 mx-auto mb-6" {...props}>
      <header className="flex justify-between font-medium pt-4 pb-5 pl-4">
        <i
          className={clsx(
            "flex items-center gap-4 text-yellow text-xl not-italic uppercase"
          )}
        >
          <i className="w-[42px] aspect-square inline-flex rounded-full border-[5px] border-yellow" />
          Namadillo
        </i>
        <div className="flex gap-8 items-center">
          {header}
          <span className="xl:hidden">
            <BurgerButton
              open={displayNavigation}
              onClick={() => setDisplayNavigation(!displayNavigation)}
            />
          </span>
        </div>
      </header>
      <div
        className={clsx(
          "xl:grid xl:grid-cols-[220px_auto] xl:gap-2 xl:min-h-[calc(100svh-100px)]"
        )}
      >
        <aside
          onClick={(e) => e.stopPropagation()}
          className={clsx(
            "transition-transform duration-500 ease-out-expo",
            "pt-10 bg-black rounded-sm fixed top-0 z-[9999] w-[240px]",
            "h-screen right-0 xl:transition-none xl:pt-0 xl:w-auto xl:relative",
            { "translate-x-full xl:translate-x-0": !displayNavigation }
          )}
        >
          {navigation}
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
};
