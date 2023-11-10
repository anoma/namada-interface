import React from "react";
import { useNavigate } from "react-router-dom";
import browser from "webextension-polyfill";

import {
  ActionButton,
  GapPatterns,
  Heading,
  KeyListItem,
  LinkButton,
  Stack,
  Text,
} from "@namada/components";
import { DerivedAccount } from "@namada/types";
import { formatRouterPath } from "@namada/utils";
import { ParentAccount } from "background/keyring";
import { AccountManagementRoute, TopLevelRoute } from "../types";
import { SettingsHeader } from "./ParentAccounts.components";

type ParentAccountsProps = {
  activeAccountId: string;
  parentAccounts: DerivedAccount[];
  onChangeActiveAccount: (
    accountId: string,
    accountType: ParentAccount
  ) => void;
  onLockApp: () => void;
};

/**
 * Represents the extension's settings page.
 */
export const ParentAccounts: React.FC<ParentAccountsProps> = ({
  activeAccountId,
  onLockApp,
  parentAccounts,
  onChangeActiveAccount,
}) => {
  const navigate = useNavigate();
  const goToSetupPage = (): void => {
    browser.tabs.create({
      url: browser.runtime.getURL("setup.html"),
    });
  };

  const goToViewAccount = (account: DerivedAccount): void => {
    navigate(
      formatRouterPath([
        TopLevelRoute.Accounts,
        AccountManagementRoute.ViewAccount.replace(
          ":accountId",
          account.id
        ).replace(":type", account.type),
      ])
    );
  };

  const goToDeletePage = (account: DerivedAccount): void => {
    navigate(
      formatRouterPath([
        TopLevelRoute.Accounts,
        AccountManagementRoute.DeleteAccount.replace(":accountId", account.id),
      ]),
      { state: { account } }
    );
  };

  const goToConnectedSites = (): void => {
    navigate(formatRouterPath([TopLevelRoute.ConnectedSites]));
  };

  return (
    <Stack gap={GapPatterns.TitleContent}>
      <Heading>Namada Keys</Heading>
      <Stack gap={4}>
        <SettingsHeader>
          <Text>Set default keys</Text>
          <ActionButton size="sm" onClick={goToSetupPage}>
            Add keys
          </ActionButton>
        </SettingsHeader>
        <Stack as="ul" gap={4}>
          {[...parentAccounts].reverse().map((account) => (
            <KeyListItem
              key={`key-listitem-${account.id}`}
              as="li"
              alias={account.alias}
              isMainKey={activeAccountId === account.id}
              onRename={() => {}}
              onDelete={() => goToDeletePage(account)}
              onViewAccount={() => goToViewAccount(account)}
              onSelectAccount={() => {
                onChangeActiveAccount(
                  account.id,
                  account.type as ParentAccount
                );
              }}
            />
          ))}
        </Stack>
        <ActionButton
          onClick={goToConnectedSites}
          variant="secondary"
          size="sm"
        >
          View Connected Sites
        </ActionButton>
        <LinkButton onClick={onLockApp} size="sm">
          Lock Wallet
        </LinkButton>
      </Stack>
    </Stack>
  );
};
