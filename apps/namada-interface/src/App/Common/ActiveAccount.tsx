import { CopyToClipboardControl } from "@namada/components";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { accountsAtom } from "slices/accounts";

export const ActiveAccount = (): JSX.Element => {
  const accounts = useAtomValue(accountsAtom);

  if (!accounts || !accounts.length) {
    return <></>;
  }

  return (
    <div>
      <span
        className={clsx(
          "px-5 py-3.5 flex items-center text-xs rounded-[2px]",
          "text-white bg-black rounded-xs"
        )}
      >
        <span className="flex items-center gap-2 ">
          <CopyToClipboardControl
            className="opacity-80 transition-opacity duration-150 hover:opacity-100"
            value={accounts[0].publicKey || ""}
          >
            {accounts[0].alias}
          </CopyToClipboardControl>
        </span>
      </span>
    </div>
  );
};
