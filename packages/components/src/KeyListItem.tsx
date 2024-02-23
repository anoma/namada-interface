import { Checkbox, DropdownMenu } from "@namada/components";

import { AccountType } from "@namada/types";
import clsx from "clsx";
import { createElement } from "react";
import { tv } from "tailwind-variants";

type KeyListItemProps = {
  as: keyof React.ReactHTML;
  alias: string;
  type: AccountType;
  isMainKey: boolean;
  onRename: () => void;
  onDelete: () => void;
  onViewAccount: () => void;
  onSelectAccount: () => void;
  onViewRecoveryPhrase: () => void;
  dropdownPosition?: "top" | "bottom";
};

const keyListItem = tv({
  base: clsx(
    "flex items-center bg-black rounded-md text-white",
    "grid text-base font-medium gap-8 grid-cols-[24px_auto_16px] p-5"
  ),
  variants: {
    selected: {
      true: "text-yellow",
    },
  },
});

export const KeyListItem = ({
  alias,
  isMainKey,
  type,
  onDelete,
  onRename,
  onViewAccount,
  onSelectAccount,
  onViewRecoveryPhrase,
  dropdownPosition = "top",
  ...props
}: KeyListItemProps): JSX.Element => {
  return createElement(
    props.as || "div",
    { className: keyListItem({ selected: isMainKey }) },
    <>
      <div>
        <Checkbox onChange={() => onSelectAccount()} checked={isMainKey} />
      </div>
      <label>{alias}</label>
      <DropdownMenu
        id={alias}
        align="right"
        position={dropdownPosition}
        items={[
          {
            label: "Set default account",
            onClick: !isMainKey ? onSelectAccount : undefined,
          },
          {
            label: "View Keys",
            onClick: onViewAccount,
          },
          {
            label: "Rename",
            onClick: onRename,
          },
          {
            label: "Delete",
            onClick: onDelete,
          },
          {
            label: "View Seed Phrase",
            onClick:
              type === AccountType.Mnemonic ? onViewRecoveryPhrase : undefined,
          },
        ]}
      />
    </>
  );
};
