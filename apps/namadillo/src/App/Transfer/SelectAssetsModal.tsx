import { SelectModal } from "App/Common/SelectModal";

type SelectItemsModalProps = {
  onClose: () => void;
};

export const SelectAssetsModal = ({
  onClose,
}: SelectItemsModalProps): JSX.Element => {
  return (
    <SelectModal onClose={onClose} title="Select Asset">
      <></>
    </SelectModal>
  );
};
