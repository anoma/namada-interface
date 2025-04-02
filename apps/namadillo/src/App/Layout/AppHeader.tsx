import { routes } from "App/routes";
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { twMerge } from "tailwind-merge";
import { Logo } from "./Logo";
import { TopNavigation } from "./TopNavigation";

export const AppHeader = ({ burger }: { burger: ReactNode }): JSX.Element => {
  return (
    <header
      className={twMerge(
        "grid gap-2",
        "grid-cols-[auto_auto] lg:grid-cols-[220px_auto]",
        "h-[80px] items-center",
        "px-6"
      )}
    >
      <div className="flex items-center gap-4">
        <span className="sm:px-0 lg:hidden">{burger}</span>
        <Link
          to={routes.root}
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
  );
};
