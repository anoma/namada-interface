import { useUntilIntegrationAttached } from "@namada/integrations";
import { Chain } from "@namada/types";
import { AccountsState } from "slices/accounts";
import { useAppSelector } from "store";

import { Intro } from "App/Common/Intro/Intro";

//TODO: move to utils when we have one
const isEmptyObject = (object: Record<string, unknown>): boolean => {
  return object ? Object.keys(object).length === 0 : true;
};

export const AccountOverview = (): JSX.Element => {
  const chain = useAppSelector<Chain>((state) => state.chain.config);

  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);

  const extensionAttachStatus = useUntilIntegrationAttached(chain);
  const currentExtensionAttachStatus =
    extensionAttachStatus[chain.extension.id];

  const hasExtensionInstalled =
    currentExtensionAttachStatus === "attached" ||
    currentExtensionAttachStatus === "pending";

  return (
    <>
      {isEmptyObject(derived[chain.id]) && (
        <div className="w-[420px] mx-auto flex items-center">
          <Intro chain={chain} hasExtensionInstalled={hasExtensionInstalled} />
        </div>
      )}
    </>
  );
};
