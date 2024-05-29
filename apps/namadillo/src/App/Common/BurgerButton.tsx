import clsx from "clsx";
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
type BurgerButtonProps = {
  open: boolean;
  onClick: () => void;
};

export const BurgerButton = ({
  open,
  onClick,
}: BurgerButtonProps): JSX.Element => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();

  useEffect(() => {
    if (open) {
      const toggle = (): void => onClick();
      document.addEventListener("click", toggle);
      return () => document.removeEventListener("click", toggle);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      onClick();
    }
  }, [location]);

  return (
    <button
      ref={buttonRef}
      aria-label="Open Navigation"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={clsx(
        "relative z-[100] flex flex-col gap-1.5 transition-colors duration-150 ease-out-quad",
        "w-6 text-white hover:text-yellow",
        "[&_i]:h-0.5 [&_i]:w-full [&_i]:bg-current"
      )}
    >
      <i
        className={clsx("transition-transform duration-150 ease-out-quad", {
          "rotate-45 translate-y-[0.5em]": open,
        })}
      />
      <i
        className={clsx("transition-opacity duration-100 ease-out-quad", {
          "opacity-0": open,
        })}
      />
      <i
        className={clsx("transition-transform duration-150 ease-out-quad", {
          "-rotate-45 -translate-y-[0.5em]": open,
        })}
      />
    </button>
  );
};
