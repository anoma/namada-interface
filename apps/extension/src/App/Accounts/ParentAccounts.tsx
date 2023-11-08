import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import browser from "webextension-polyfill";

import {
  ActionButton,
  Alert,
  Heading,
  KeyListItem,
  Stack,
  Text,
} from "@namada/components";
import { DerivedAccount } from "@namada/types";

import {
  ParentAccount,
  QueryParentAccountsMsg,
  SetActiveAccountMsg,
} from "background/keyring";

import { LockVaultMsg } from "background/vault";
import { formatRouterPath } from "@namada/utils";
import { Ports } from "router";
import { Status } from "../App";
import { AccountManagementRoute, TopLevelRoute } from "../types";
import { SettingsHeader } from "./ParentAccounts.components";
import { useRequester } from "hooks/useRequester";

/**
 * Represents the extension's settings page.
 */
export const ParentAccounts: React.FC<{
  activeAccountId: string;
  onSelectAccount: (account: DerivedAccount) => void;
}> = ({ activeAccountId, onSelectAccount }) => {
  const [status, setStatus] = useState<Status>(Status.Pending);
  const [error, setError] = useState<string>("");
  const [parentAccounts, setParentAccounts] = useState<DerivedAccount[]>([]);

  const requester = useRequester();
  const navigate = useNavigate();

  const fetchParentAccounts = async (): Promise<void> => {
    setStatus(Status.Pending);
    try {
      const accounts = await requester.sendMessage(
        Ports.Background,
        new QueryParentAccountsMsg()
      );
      setParentAccounts(accounts);
      setStatus(Status.Completed);
    } catch (e) {
      console.error(e);
      setError(`An error occurred while loading extension: ${e}`);
      setStatus(Status.Failed);
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

      // Lock current wallet keyring:
      await requester.sendMessage(Ports.Background, new LockVaultMsg());

      // Fetch accounts for selected parent account
      onSelectAccount(account);
    } catch (e) {
      console.error(e);
      setError(`An error occurred while setting active account: ${e}`);
      setStatus(Status.Failed);
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

  // we use a ref to make sure the effect does not run on the first
  // render, which would be before parent accounts have loaded
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    (async () => {
      if (parentAccounts.length === 0) {
        // the last account has been deleted so navigate to setup
        navigate(TopLevelRoute.Setup);
      } else if (!parentAccounts.some(({ id }) => id === activeAccountId)) {
        // the active account was deleted so make the first account active
        await handleSelectAccount(parentAccounts[0]);
      }
    })();
  }, [parentAccounts]);

  useEffect(() => {
    fetchParentAccounts();
  }, []);

  return (
    <>
      <Heading>Namada Keys</Heading>
      <Stack gap={4}>
        {error && <Alert type="error">{error}</Alert>}
        {status === Status.Pending && "loading"}
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
      </Stack>
    </>
  );
};
