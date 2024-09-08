import { getIntegration } from "@namada/integrations/hooks/useIntegration";
import { updateDefaultAccountAtom } from "atoms/accounts";
import { useAtomValue } from "jotai";
import { SwitchAccountIcon } from "./SwitchAccountIcon";

export const SwitchAccount = (): JSX.Element => {
  const { mutateAsync: updateAccount } = useAtomValue(updateDefaultAccountAtom);

  const buttonClassName =
    "p-1 opacity-80 transition-opacity duration-150 hover:opacity-100";

  return (
    <button
      className={buttonClassName}
      onClick={async () => {
        const integration = getIntegration("namada");
        const accounts = (await integration.accounts())?.filter(
          (a) => !a.isShielded
        );
        if (!accounts) return;
        const { address } =
          accounts[Math.floor(Math.random() * accounts?.length)];
        updateAccount(address);
      }}
    >
      <SwitchAccountIcon />
    </button>
  );
};
