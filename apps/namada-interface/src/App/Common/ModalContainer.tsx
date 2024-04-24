import { Stack } from "@namada/components";
import { useEffect } from "react";
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

  return (
    <div className="flex flex-col w-[75vw] h-[85svh] overflow-auto px-6 py-6 bg-neutral-800 text-white rounded-md">
      <header className="flex w-full justify-center items-center relative mb-3 text-xl text-medium">
        {header}
        <i
          className="cursor-pointer text-white absolute -right-1.5 text-3xl p-1.5 hover:text-yellow"
          onClick={onClose}
        >
          <IoClose />
        </i>
      </header>
      <Stack gap={2} className="flex-1">
        {children}
      </Stack>
    </div>
  );
};
