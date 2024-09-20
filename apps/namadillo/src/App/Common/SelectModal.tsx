import { Modal } from "@namada/components";
import clsx from "clsx";
import React from "react";
import { IoClose } from "react-icons/io5";
import { ModalTransition } from "./ModalTransition";

type SelectModalProps = {
  children: React.ReactNode;
  title: React.ReactNode;
  onClose: () => void;
};

export const SelectModal = ({
  children,
  title,
  onClose,
}: SelectModalProps): JSX.Element => {
  return (
    <Modal onClose={onClose}>
      <ModalTransition>
        <div
          className={clsx(
            "px-3 pt-2 pb-6 bg-rblack max-w-[400px] min-h-[120px] w-screen rounded-xl border border-neutral-700"
          )}
        >
          <header className="flex w-full justify-center items-center relative mb-4 text-light leading-8">
            {title}
            <i
              className="cursor-pointer text-white absolute right-0 text-xl p-1.5 hover:text-yellow z-50"
              onClick={onClose}
            >
              <IoClose />
            </i>
          </header>
          {children}
        </div>
      </ModalTransition>
    </Modal>
  );
};
