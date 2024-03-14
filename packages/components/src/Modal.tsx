import { useEffect } from "react";

type ModalProps = {
  children: JSX.Element;
  onClose: () => void;
};

export const Modal = ({ onClose, children }: ModalProps): JSX.Element => {
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
      <div
        onClick={onClose}
        className="fixed top-0 left-0 w-full h-full cursor-pointer backdrop-blur-lg z-[1000] bg-rblack/50"
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 z-[1001]">
        {children}
      </div>
    </>
  );
};
