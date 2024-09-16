import { Modal } from "@namada/components";
import { SelectModal } from "App/Common/SelectModal";
import clsx from "clsx";

type SelectItemsModalProps = {
  title?: string;
  onClose: () => void;
  content: React.ReactNode;
};

export const SelectItemsModal = ({
  onClose,
  title,
  content,
}: SelectItemsModalProps): JSX.Element => {
  return <SelectModal title="Select Source Modal"></SelectModal>;
  return (
    <Modal onClose={onClose}>
      <div
        role="dialog"
        className={clsx(
          "bg-rblack rounded-sm border border-neutral-600 py-3 px-8",
          "w-[480px]"
        )}
      >
        <header className="relative text-center mb-4">{title}</header>
        {content}
      </div>
    </Modal>
  );
};
