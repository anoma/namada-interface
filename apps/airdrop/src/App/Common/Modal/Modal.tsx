import { useEffect } from "react";
import {
  ModalCloseIcon,
  ModalContainer,
  ModalContent,
  ModalContentWrapper,
  ModalHeader,
  ModalOverlay,
} from "./Modal.component";

type ModalProps = {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
};

export const Modal = ({
  onClose,
  isOpen,
  title,
  children,
}: ModalProps): JSX.Element => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key == "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);
  if (!isOpen) {
    return <></>;
  }

  return (
    <>
      <ModalOverlay onClick={onClose} />
      <ModalContainer>
        <ModalContentWrapper>
          <ModalHeader>
            <span>{title}</span>
            <ModalCloseIcon onClick={onClose}>&#x2715;</ModalCloseIcon>
          </ModalHeader>
          <ModalContent>{children}</ModalContent>
        </ModalContentWrapper>
      </ModalContainer>
    </>
  );
};
