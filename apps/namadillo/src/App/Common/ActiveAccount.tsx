import { CopyToClipboardControl } from "@namada/components";
import { defaultAccountAtom } from "atoms/accounts";
import clsx from "clsx";
import { useAtomValue } from "jotai";

export const ActiveAccount = (): JSX.Element => {
  const { data: account, isFetching } = useAtomValue(defaultAccountAtom);

  if (!account || isFetching) {
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
            value={account.address || ""}
          >
            {account.alias}
          </CopyToClipboardControl>
        </span>
      </span>
    </div>
  );
};
