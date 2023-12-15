import { default as ReactModal } from "react-modal";
import { tv } from "tailwind-variants";

type Props = {
  children: JSX.Element;
  isOpen: boolean;
  title?: string;
  onBackdropClick?: () => void;
};

const modal = tv({
  slots: {
    container: "flex flex-col items-center w-full bg-neutral-900",
    header: "flex justify-center items-center text-neutral-200",
    content: "flex items-center justify-center w-full bg-neutral-900",
  },
});

export const Modal = (props: Props): JSX.Element => {
  const { children, isOpen, title, onBackdropClick } = props;

  const { container, header, content } = modal();

  return (
    <ReactModal
      shouldCloseOnOverlayClick={onBackdropClick !== undefined}
      onRequestClose={() => {
        onBackdropClick && onBackdropClick();
      }}
      style={{
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.75)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: "1100",
        },
        content: {
          top: "undefined",
          left: "undefined",
          right: "undefined",
          bottom: "undefined",
          zIndex: "1100",
          display: "flex",
          justifyContent: "center",
          width: "80%",
          maxWidth: "640px",
          height: "80%",
          padding: 0,
        },
      }}
      isOpen={isOpen}
      ariaHideApp={false}
    >
      <div className={container()}>
        <header className={header()}>
          <h3>{title}</h3>
        </header>
        <div className={content()}>{children}</div>
      </div>
    </ReactModal>
  );
};
