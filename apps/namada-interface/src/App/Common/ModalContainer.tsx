import { IoClose } from "react-icons/io5";

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
    <div className="flex flex-col lg:w-[90vw] 2xl:w-[75vw] h-[90svh] overflow-auto px-6 py-6 bg-neutral-800 text-white rounded-md">
      <header className="flex w-full justify-center items-center relative mb-3 text-xl text-medium">
        {header}
        <i
          className="cursor-pointer text-white absolute -right-1.5 text-3xl p-1.5 hover:text-yellow"
          onClick={onClose}
        >
          <IoClose />
        </i>
      </header>
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
};
