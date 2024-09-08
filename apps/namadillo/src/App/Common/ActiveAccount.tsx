import { CopyToClipboardControl, Tooltip } from "@namada/components";
import { defaultAccountAtom } from "atoms/accounts";
import { useAtomValue } from "jotai";

export const ActiveAccount = (): JSX.Element => {
  const { data: account } = useAtomValue(defaultAccountAtom);

  if (!account) {
    return <></>;
  }

  return (
    <span className="flex items-center gap-2 relative group/tooltip">
      <CopyToClipboardControl
        className="p-1 opacity-80 transition-opacity hover:opacity-100"
        value={account.address || ""}
      >
        {account.alias}
      </CopyToClipboardControl>
      <Tooltip position="left">{account.address}</Tooltip>
    </span>
  );
};
