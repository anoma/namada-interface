import { ReactNode, useState } from "react";
import { Link } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import { BurgerButton } from "./BurgerButton";
import { Logo } from "./Logo";
import { Navigation } from "./Navigation";
import { TopNavigation } from "./TopNavigation";

export const AppLayout = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element => {
  const [displayNavigation, setDisplayNavigation] = useState(false);

  return (
    <div className="custom-container pb-2">
      <header
        className={twMerge(
          "flex items-center",
          "lg:grid lg:grid-cols-[220px_auto]",
          "gap-4",
          "h-[80px]",
          "px-6 sm:px-0"
        )}
      >
        <div className="flex items-center gap-4">
          <span className="sm:px-0 lg:hidden">
            <BurgerButton
              open={displayNavigation}
              onClick={() => setDisplayNavigation(!displayNavigation)}
            />
          </span>
          <Link
            to={"/"}
            className={twMerge(
              "flex items-center gap-3",
              "text-yellow text-xl font-medium uppercase"
            )}
          >
            <span className="w-[40px]">
              <Logo eyeOpen={true} />
            </span>
            <span className="hidden sm:block">Namadillo</span>
          </Link>
        </div>
        <TopNavigation />
      </header>
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
