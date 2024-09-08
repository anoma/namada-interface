import { accountsAtom, updateDefaultAccountAtom } from "atoms/accounts";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { SwitchAccountIcon } from "./SwitchAccountIcon";

export const SwitchAccount = (): JSX.Element => {
  const { data } = useAtomValue(accountsAtom);
  const { mutateAsync: updateAccount } = useAtomValue(updateDefaultAccountAtom);

  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        className="p-1 opacity-80 transition-opacity hover:opacity-100"
        onClick={() => setOpen(true)}
      >
        <SwitchAccountIcon />
      </button>
      {open && (
        <div
          className={twMerge(
            "absolute right-0 z-10",
            "bg-black py-1",
            "border border-yellow rounded-sm"
          )}
        >
          {data
            ?.filter((i) => !i.isShielded)
            .map(({ alias, address }) => (
              <button
                key={alias}
                className={twMerge(
                  "block w-full py-1 px-2",
                  "whitespace-nowrap text-left",
                  "cursor-pointer hover:text-yellow transition-colors"
                )}
                onClick={async () => {
                  setOpen(false);
                  updateAccount(address);
                }}
              >
                {alias}
              </button>
            ))}
        </div>
      )}
    </div>
  );
};
