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
import { AccountContext, useSettingsContext } from "context";
import { isOutdatedShieldedAccount, openSetupTab } from "utils";

type Account = DerivedAccount & { outdated: boolean };

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

  const { showDisposableAccounts } = useSettingsContext();

  const allParentAccounts = parentAccounts.reduce(
    (acc, account) => {
      acc[account.id] = { ...account, outdated: false };
      return acc;
    },
    {} as Record<string, Account>
  );

  // We check which accounts need to be re-imported
  allAccounts
    .filter(
      (account) => account.parentId || account.type === AccountType.Ledger
    )
    .forEach((account) => {
      const parent = allParentAccounts[account.parentId!];
      if (parent) {
        const outdated = isOutdatedShieldedAccount(account, parent.type);
        allParentAccounts[parent.id] = { ...parent, outdated };
      }
    });

  const accounts = Object.values(allParentAccounts);

  useEffect(() => {
    const hasOutdatedAccounts = accounts.some(
      (account: Account) => account.outdated
    );
    // If there are outdated accounts, we redirect to the update required page
    if (hasOutdatedAccounts) {
      navigate(routes.accountsUpdateRequired());
    }
  }, []);

  const goToSetupPage = async (): Promise<void> => {
    await openSetupTab();
  };

  const goToViewAccount = (account: Account): void => {
    navigate(routes.viewAccount(account.id));
  };

  const goToDeletePage = (account: Account): void => {
    navigate(routes.deleteAccount(account.id), { state: { account } });
  };

  const goToViewRecoveryPhrase = (account: Account): void => {
    navigate(routes.viewAccountMnemonic(account.id));
  };

  const goToRenameAccount = (account: Account): void => {
    navigate(routes.renameAccount(account.id), { state: { account } });
  };

  const goToDisposableKeyDetails = (account: Account): void => {
    navigate(routes.disposableKeyDetails(account.id), { state: { account } });
  };

  // Filter out disposable accounts if the setting is disabled
  const filteredAccounts =
    !showDisposableAccounts ?
      accounts.filter((account) => account.type !== AccountType.Disposable)
    : accounts;

  // Sort accounts so disposable accounts are at the bottom
  const sortedAccounts = filteredAccounts.sort((a, b) => {
    const disposableA = a.type === AccountType.Disposable;
    const disposableB = b.type === AccountType.Disposable;
    if (disposableA && !disposableB) {
      return -1;
    }
    if (!disposableA && disposableB) {
      return 1;
    }
    return 0;
  });

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
            {[...sortedAccounts].reverse().map((account, idx) => (
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
                onDisposableKeyDetails={() => goToDisposableKeyDetails(account)}
                onSelectAccount={() => {
                  changeActiveAccountId(
                    account.id,
                    account.type as AccountType
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
