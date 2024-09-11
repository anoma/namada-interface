import clsx from "clsx";
import { HTMLMotionProps } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { twMerge } from "tailwind-merge";
import { ModalTransition } from "./ModalTransition";

type ModalContainerProps = {
  header: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  containerProps?: HTMLMotionProps<"div">;
  contentProps?: React.ComponentPropsWithoutRef<"div">;
};

export const ModalContainer = ({
  header,
  onClose,
  children,
  contentProps = {},
  containerProps = {},
}: ModalContainerProps): JSX.Element => {
  const { className: containerClassName, ...otherProps } = containerProps;
  const { className: contentClassName, ...otherContentProps } = contentProps;
  return (
    <ModalTransition
      className={twMerge(
        clsx(
          "relative flex flex-col",
          "w-[100vw] sm:w-[95vw] lg:w-[90vw] 2xl:w-[75vw] h-[100svh] sm:h-[90svh]",
          "overflow-auto px-6 pt-3.5 pb-4 bg-neutral-800 text-white rounded-md"
        ),
        containerClassName
      )}
      {...otherProps}
    >
      <i
        className="cursor-pointer text-white absolute top-1.5 right-6 text-3xl p-1.5 hover:text-yellow z-50"
        onClick={onClose}
      >
        <IoClose />
      </i>
      <header className="flex w-full justify-center items-center relative mb-3 text-xl text-medium">
        {header}
      </header>
      <div
        className={twMerge("flex-1 overflow-hidden", contentClassName)}
        {...otherContentProps}
      >
        {children}
      </div>
    </ModalTransition>
  );
};
