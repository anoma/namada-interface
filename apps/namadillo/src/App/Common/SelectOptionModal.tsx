import { Modal } from "@namada/components";
import { Fragment } from "react";
import { AssetsModalCard } from "./AssetsModalCard";
import { ModalContainer } from "./ModalContainer";

type Entry = {
  title: string;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
};

type SelectOptionModalProps = {
  title: string;
  onClose: () => void;
  items: Entry[];
};

export const SelectOptionModal = ({
  title,
  onClose,
  items,
}: SelectOptionModalProps): JSX.Element => {
  return (
    <Modal onClose={onClose}>
      <ModalContainer
        header={title}
        onClose={onClose}
        containerProps={{ className: "!w-auto !h-auto bg-black" }}
      >
        <ul className="grid grid-cols-[1fr_1px_1fr] gap-4 pt-1">
          {items.map((item, index) => (
            <Fragment key={index}>
              <li>
                <AssetsModalCard {...item}>{item.children}</AssetsModalCard>
              </li>
              {index + 1 < items.length && (
                <li className="w-px bg-white -my-1" />
              )}
            </Fragment>
          ))}
        </ul>
      </ModalContainer>
    </Modal>
  );
};
