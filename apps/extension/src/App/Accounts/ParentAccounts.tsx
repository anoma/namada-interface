import { useContext, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import {
  ActionButton,
  GapPatterns,
  KeyListItem,
  Stack,
} from "@namada/components";
import { AccountType, DerivedAccount } from "@namada/types";
import { ParentAccountsFooter } from "App/Accounts/ParentAccountsFooter";
import { PageHeader } from "App/Common";
import routes from "App/routes";
import { ParentAccount } from "background/keyring";
import { AccountContext } from "context";
import { openSetupTab } from "utils";

/**
 * Represents the extension's settings page.
 */
export const ParentAccounts = (): JSX.Element => {
  const navigate = useNavigate();
  const {
    activeAccountId,
    parentAccounts,
    accounts: allAccounts,
    changeActiveAccountId,
  } = useContext(AccountContext);

  // We check which accounts need to be re-imported
  const accounts = allAccounts
    .filter(
      (account) => account.parentId || account.type === AccountType.Ledger
    )
    .map((account) => {
      const outdated =
        account.type !== AccountType.Ledger &&
        typeof account.pseudoExtendedKey === "undefined";

      // The only account without a parent is the ledger account
      const parent =
        parentAccounts.find((pa) => pa.id === account.parentId) || account;

      return { ...parent, outdated };
    });

  useEffect(() => {
    const hasOutdatedAccounts = accounts.some((account) => account.outdated);
    // If there are outdated accounts, we redirect to the update required page
    if (hasOutdatedAccounts) {
      navigate(routes.accountsUpdateRequired());
    }
  }, []);

  const goToSetupPage = async (): Promise<void> => {
    await openSetupTab();
  };

  const goToViewAccount = (account: DerivedAccount): void => {
    navigate(routes.viewAccount(account.id));
  };

  const goToDeletePage = (account: DerivedAccount): void => {
    navigate(routes.deleteAccount(account.id), { state: { account } });
  };

  const goToViewRecoveryPhrase = (account: DerivedAccount): void => {
    navigate(routes.viewAccountMnemonic(account.id));
  };

  const goToRenameAccount = (account: DerivedAccount): void => {
    navigate(routes.renameAccount(account.id), { state: { account } });
  };

  return (
    <>
      <Stack
        gap={GapPatterns.TitleContent}
        full
        className="max-h-[calc(100vh-40px)]"
      >
        <PageHeader title="Select Account" />
        <Stack gap={4} className="flex-1 overflow-auto">
          <nav className="grid items-end grid-cols-[auto_min-content]">
            <p className="text-white font-medium text-xs">Set default keys</p>
            <div className="w-26">
              <ActionButton size="xs" onClick={goToSetupPage}>
                Add Keys
              </ActionButton>
            </div>
          </nav>
          <Stack as="ul" gap={3} className="flex-1 overflow-auto">
            {[...accounts].reverse().map((account, idx) => (
              <KeyListItem
                key={`key-listitem-${account.id}`}
                as="li"
                alias={account.alias}
                type={account.type}
                outdated={account.outdated}
                dropdownPosition={
                  idx > 2 && idx > accounts.length - 4 ? "bottom" : "top"
                }
                isMainKey={activeAccountId === account.id}
                onRename={() => goToRenameAccount(account)}
                onDelete={() => goToDeletePage(account)}
                onViewAccount={() => goToViewAccount(account)}
                onViewRecoveryPhrase={() => goToViewRecoveryPhrase(account)}
                onSelectAccount={() => {
                  changeActiveAccountId(
                    account.id,
                    account.type as ParentAccount
                  );
                }}
              />
            ))}
          </Stack>
          <ParentAccountsFooter />
        </Stack>
      </Stack>

      <Outlet />
    </>
  );
};
