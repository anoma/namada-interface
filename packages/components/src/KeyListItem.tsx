import { Checkbox, DropdownMenu, Stack } from "@namada/components";

import { AccountType } from "@namada/types";
import clsx from "clsx";
import { createElement } from "react";
import { FaChevronRight } from "react-icons/fa6";
import { PiWarning } from "react-icons/pi";
import { tv } from "tailwind-variants";

type KeyListItemProps = {
  as: keyof React.ReactHTML;
  alias: string;
  type: AccountType;
  outdated: boolean;
  isMainKey: boolean;
  onRename: () => void;
  onDelete: () => void;
  onViewAccount: () => void;
  onSelectAccount: () => void;
  onViewRecoveryPhrase: () => void;
  onDisposableKeyDetails: () => void;
  dropdownPosition?: "top" | "bottom";
};

const keyListItem = tv({
  base: clsx(
    "flex items-center bg-black rounded-md text-white",
    "grid text-base font-medium gap-8 grid-cols-[24px_1fr_auto] p-5"
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
  outdated,
  onDelete,
  onRename,
  onViewAccount,
  onSelectAccount,
  onViewRecoveryPhrase,
  onDisposableKeyDetails,
  dropdownPosition = "top",
  ...props
}: KeyListItemProps): JSX.Element => {
  return createElement(
    props.as || "div",
    { className: keyListItem({ selected: isMainKey }) },
    <>
      <div>
        <Checkbox
          type="radio"
          onChange={() => onSelectAccount()}
          checked={isMainKey}
        />
      </div>
      <label
        className="text-ellipsis overflow-hidden whitespace-nowrap"
        title={alias}
      >
        {alias}
      </label>
      <Stack direction="horizontal" gap={2} className="items-center">
        {outdated && (
          <PiWarning className="inline text-yellow w-[24px] h-[24px]" />
        )}
        {type !== AccountType.Disposable && (
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
                  type === AccountType.Mnemonic ?
                    onViewRecoveryPhrase
                  : undefined,
              },
            ]}
          />
        )}
        {type === AccountType.Disposable && (
          <button
            onClick={onDisposableKeyDetails}
            className={clsx("text-white text-lg")}
          >
            <FaChevronRight />
          </button>
        )}
      </Stack>
    </>
  );
};
