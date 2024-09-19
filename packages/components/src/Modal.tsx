import clsx from "clsx";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { twMerge } from "tailwind-merge";

type ModalProps = {
  children: JSX.Element;
  onClose: () => void;
} & React.ComponentPropsWithoutRef<"div">;

export const Modal = ({
  onClose,
  children,
  className = "",
  ...props
}: ModalProps): JSX.Element => {
  useEffect(() => {
    const onKeyPress = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyPress);
    return () => {
      document.removeEventListener("keydown", onKeyPress);
    };
  }, []);

  useEffect(() => {
    const classList = ["max-h-[100svh]", "overflow-hidden"];
    document.body.classList.add(...classList);
    return () => {
      document.body.classList.remove(...classList);
    };
  }, []);

  return (
    <>
      <motion.div
        transition={{ duration: 0 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed top-0 left-0 w-full h-full cursor-pointer backdrop-blur-lg z-[1000] bg-rblack/50"
      />
      <div
        {...props}
        role="dialog"
        className={twMerge(
          clsx(
            "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 z-[1001]",
            className
          )
        )}
      >
        {children}
      </div>
    </>
  );
};
