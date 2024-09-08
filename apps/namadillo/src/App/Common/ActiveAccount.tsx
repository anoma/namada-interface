import { CopyToClipboardControl, Tooltip } from "@namada/components";
import { defaultAccountAtom } from "atoms/accounts";
import { useAtomValue } from "jotai";

export const ActiveAccount = (): JSX.Element => {
  const { data: account, isFetching } = useAtomValue(defaultAccountAtom);

  if (!account || isFetching) {
    return <></>;
  }

  const buttonClassName =
    "p-1 opacity-80 transition-opacity duration-150 hover:opacity-100";

  return (
    <span className="flex items-center gap-2 relative group/tooltip">
      <CopyToClipboardControl
        className={buttonClassName}
        value={account.address || ""}
      >
        {account.alias}
      </CopyToClipboardControl>
      <Tooltip position="left">{account.address}</Tooltip>
    </span>
  );
};
