import clsx from "clsx";
import { IoClose } from "react-icons/io5";
import { ModalTransition } from "./ModalTransition";

type ModalContainerProps = {
  header: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
};

export const ModalContainer = ({
  header,
  onClose,
  children,
}: ModalContainerProps): JSX.Element => {
  return (
    <ModalTransition
      className={clsx(
        "relative flex flex-col w-[95vw] lg:w-[90vw] 2xl:w-[75vw] h-[90svh]",
        "overflow-auto px-6 py-6 bg-neutral-800 text-white rounded-md"
      )}
    >
      <i
        className="cursor-pointer text-white absolute top-4 right-6 text-3xl p-1.5 hover:text-yellow z-50"
        onClick={onClose}
      >
        <IoClose />
      </i>
      <header className="flex w-full justify-center items-center relative mb-3 text-xl text-medium">
        {header}
      </header>
      <div className="flex-1 overflow-hidden">{children}</div>
    </ModalTransition>
  );
};
