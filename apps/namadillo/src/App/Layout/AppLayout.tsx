import { ReactNode, useState } from "react";
import { twMerge } from "tailwind-merge";
import { AppHeader } from "./AppHeader";
import { BurgerButton } from "./BurgerButton";
import { Navigation } from "./Navigation";

export const AppLayout = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element => {
  const [displayNavigation, setDisplayNavigation] = useState(false);

  return (
    <div className="custom-container pb-2">
      <AppHeader
        burger={
          <span className="sm:px-0 lg:hidden">
            <BurgerButton
              open={displayNavigation}
              onClick={() => setDisplayNavigation(!displayNavigation)}
            />
          </span>
        }
      />
      <div
        className={twMerge(
          "grid lg:grid-cols-[220px_auto] lg:gap-2 min-h-[calc(100svh-95px)]"
        )}
      >
        <aside
          onClick={(e) => e.stopPropagation()}
          className={twMerge(
            "transition-transform duration-500 ease-out-expo",
            "pt-10 bg-black rounded-sm fixed top-0 z-[9999] w-[240px]",
            "h-svh lg:h-[calc(100svh-90px)] left-0 lg:z-0 lg:transition-none",
            "lg:pt-0 lg:w-auto lg:relative",
            !displayNavigation && "-translate-x-full lg:translate-x-0"
          )}
        >
          <Navigation />
        </aside>
        <main className="min-h-full">{children}</main>
      </div>
    </div>
  );
};
