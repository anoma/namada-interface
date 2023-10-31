import { Checkbox, DropdownMenu } from "@namada/components";
import { Alias, ItemContainer } from "./KeyListItem.components";

type KeyListItemProps = {
  as?: keyof JSX.IntrinsicElements;
  alias: string;
  isMainKey: boolean;
  onRename: () => void;
  onDelete: () => void;
  onViewAccount: () => void;
  onSelectAccount: () => void;
};

export const KeyListItem = ({
  as = "div",
  alias,
  isMainKey,
  onRename,
  onDelete,
  onViewAccount,
  onSelectAccount,
}: KeyListItemProps): JSX.Element => {
  return (
    <ItemContainer as={as}>
      <Checkbox onChange={() => onSelectAccount()} checked={isMainKey} />
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
