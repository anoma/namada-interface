import { Logo } from "App/Layout/Logo";
import clsx from "clsx";

export const AlphaVersionTopHeader = (): JSX.Element => {
  return (
    <div
      className={clsx(
        "w-full bg-black flex items-center py-1.5 px-4 leading-tight",
        "justify-center text-yellow text-sm gap-2 z-50"
      )}
    >
      <i className="w-[1.5em]">
        <Logo eyeOpen={true} />
      </i>
      Please be aware that Namadillo is still in the alpha phase. Development is
      ongoing to improve the user experience.
    </div>
  );
};
