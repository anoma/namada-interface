import { useEffect, useLayoutEffect, useRef } from "react";
import {
  ModalCloseIcon,
  ModalContainer,
  ModalContent,
  ModalContentWrapper,
  ModalHeader,
  ModalOverlay,
} from "./Modal.component";
import gsap, { Expo } from "gsap";

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
  const modalContainerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!isOpen) return;

    gsap.context(() => {
      const tl = gsap.timeline();
      tl.fromTo(
        ".container-wrapper",
        { scale: 0 },
        { scale: 1, duration: 0.25, ease: Expo.easeOut }
      );

      tl.fromTo(
        ".content-wrapper",
        { opacity: 0 },
        { opacity: 1, ease: Expo.easeOut },
        "-=0.15"
      );
    }, [modalContainerRef]);
  }, [isOpen]);

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
      <div ref={modalContainerRef}>
        <ModalContainer className="container-wrapper">
          <ModalContentWrapper className="content-wrapper">
            <ModalHeader>
              <span>{title}</span>
              <ModalCloseIcon onClick={onClose}>&#x2715;</ModalCloseIcon>
            </ModalHeader>
            <ModalContent>{children}</ModalContent>
          </ModalContentWrapper>
        </ModalContainer>
      </div>
    </>
  );
};
