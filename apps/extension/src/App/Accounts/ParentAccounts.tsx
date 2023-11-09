import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import browser from "webextension-polyfill";

import {
  ActionButton,
  Alert,
  Heading,
  KeyListItem,
  LinkButton,
  Stack,
  Text,
} from "@namada/components";
import { DerivedAccount } from "@namada/types";

import {
  ParentAccount,
  QueryParentAccountsMsg,
  SetActiveAccountMsg,
} from "background/keyring";

import { formatRouterPath } from "@namada/utils";
import { useRequester } from "hooks/useRequester";
import { Ports } from "router";
import { LoadingStatus } from "../types";
import { AccountManagementRoute, TopLevelRoute } from "../types";
import { SettingsHeader } from "./ParentAccounts.components";

/**
 * Represents the extension's settings page.
 */
export const ParentAccounts: React.FC<{
  activeAccountId: string;
  onLockApp: () => void;
  onSelectAccount: (account: DerivedAccount) => void;
}> = ({ activeAccountId, onSelectAccount, onLockApp }) => {
  const [status, setStatus] = useState<LoadingStatus>(LoadingStatus.Pending);
  const [error, setError] = useState<string>("");
  const [parentAccounts, setParentAccounts] = useState<DerivedAccount[]>([]);

  const requester = useRequester();
  const navigate = useNavigate();

  const fetchParentAccounts = async (): Promise<void> => {
    setStatus(LoadingStatus.Pending);
    try {
      const accounts = await requester.sendMessage(
        Ports.Background,
        new QueryParentAccountsMsg()
      );
      setParentAccounts(accounts);
      setStatus(LoadingStatus.Completed);
    } catch (e) {
      console.error(e);
      setError(`An error occurred while loading extension: ${e}`);
      setStatus(LoadingStatus.Failed);
    }
  };

  const handleSelectAccount = async (
    account: DerivedAccount
  ): Promise<void> => {
    const { id, type } = account;
    try {
      await requester.sendMessage(
        Ports.Background,
        new SetActiveAccountMsg(id, type as ParentAccount)
      );

      // Fetch accounts for selected parent account
      onSelectAccount(account);
    } catch (e) {
      console.error(e);
      setError(`An error occurred while setting active account: ${e}`);
      setStatus(LoadingStatus.Failed);
    }
  };

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

  useEffect(() => {
    fetchParentAccounts();
  }, []);

  return (
    <>
      <Heading>Namada Keys</Heading>
      <Stack gap={4}>
        {error && <Alert type="error">{error}</Alert>}
        {status === LoadingStatus.Pending && "loading"}
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
              onSelectAccount={() => handleSelectAccount(account)}
              onDelete={() => goToDeletePage(account)}
              onViewAccount={() => goToViewAccount(account)}
              onRename={() => {}}
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
    </>
  );
};
