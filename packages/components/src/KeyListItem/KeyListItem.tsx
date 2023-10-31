import { Checkbox, DropdownMenu } from "@namada/components";
import { Alias, ItemContainer } from "./KeyListItem.components";

type KeyListItemProps = {
  alias: string;
  isMainKey: boolean;
  onRename: () => void;
  onDelete: () => void;
  onViewAccount: () => void;
  onCheck: () => void;
};

export const KeyListItem = ({
  alias,
  isMainKey,
  onRename,
  onDelete,
  onViewAccount,
  onCheck,
}: KeyListItemProps): JSX.Element => {
  return (
    <ItemContainer>
      <Checkbox onChange={() => onCheck()} checked={isMainKey} />
      <Alias>{alias}</Alias>
      <DropdownMenu
        id={alias}
        align="right"
        items={[
          {
            label: "View Accounts",
            onClick: onViewAccount,
          },
          {
            label: "Change key name",
            onClick: onRename,
          },
          {
            label: "Delete keys",
            onClick: onDelete,
          },
        ]}
      />
    </ItemContainer>
  );
};
