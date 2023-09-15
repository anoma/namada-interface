import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import browser from "webextension-polyfill";

import { AccountType, DerivedAccount } from "@namada/types";
import { Button, ButtonVariant } from "@namada/components";

import { ExtensionRequester } from "extension";
import { Ports } from "router";
import {
  LockKeyRingMsg,
  SetActiveAccountMsg,
  QueryParentAccountsMsg,
  ParentAccount,
} from "background/keyring";
import {
  SettingsContainer,
  ButtonsContainer,
  ParentAccountsList,
  ParentAccountsListItemContainer,
  ParentAccountDetails,
  ParentAccountSideButton,
  ModeSelectLink,
  ModeSelectContainer,
} from "./Settings.components";
import {
  AccountsContainer,
  ThemedScrollbarContainer,
} from "../Accounts/Accounts.components";
import { TopLevelRoute } from "../types";
import { Status } from "../App";
import { ExtraSettings } from "./ExtraSettings";
import { Mode, ExtraSetting } from "./ExtraSettings/types";

/**
 * Represents the extension's settings page.
 */
const Settings: React.FC<{
  activeAccountId: string;
  requester: ExtensionRequester;
  onSelectAccount: (account: DerivedAccount) => void;
}> = ({ activeAccountId, requester, onSelectAccount }) => {
  const [extraSetting, setExtraSetting] = useState<ExtraSetting | null>(null);
  const [status, setStatus] = useState<Status>(Status.Pending);
  const [error, setError] = useState<string>("");
  const [parentAccounts, setParentAccounts] = useState<DerivedAccount[]>([]);

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

  useEffect(() => {
    fetchParentAccounts();
  }, []);

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
      await requester.sendMessage(Ports.Background, new LockKeyRingMsg());

      // Fetch accounts for selected parent account
      onSelectAccount(account);
    } catch (e) {
      console.error(e);
      setError(`An error occurred while setting active account: ${e}`);
      setStatus(Status.Failed);
    }
  };

  const onDeleteAccount = async (): Promise<void> => {
    await fetchParentAccounts();
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

  return (
    <SettingsContainer>
      <AccountsContainer>
        <ThemedScrollbarContainer>
          {status === Status.Failed && (
            <p>Error communicating with extension background!</p>
          )}
          <p>{error ? error : "Select account:"}</p>

          <ParentAccountsList>
            {parentAccounts.map((account, i) => (
              <AccountListItem
                key={i}
                account={account}
                activeAccountId={activeAccountId}
                onSelectAccount={() => handleSelectAccount(account)}
                onSelectMode={(mode) =>
                  setExtraSetting({
                    mode,
                    accountId: account.id,
                    accountType: account.type as ParentAccount,
                  })
                }
              />
            ))}
          </ParentAccountsList>

          <ButtonsContainer>
            <Button
              variant={ButtonVariant.ContainedAlternative}
              onClick={() => navigate(TopLevelRoute.Accounts)}
            >
              Back
            </Button>
            <Button
              variant={ButtonVariant.ContainedAlternative}
              onClick={() => {
                browser.tabs.create({
                  url: browser.runtime.getURL("setup.html"),
                });
              }}
            >
              Add Account
            </Button>
          </ButtonsContainer>

          <ModeSelectContainer>
            <ModeSelectLink
              onClick={() => setExtraSetting({ mode: Mode.ConnectedSites })}
            >
              {Mode.ConnectedSites}
            </ModeSelectLink>
          </ModeSelectContainer>

          <ExtraSettings
            extraSetting={extraSetting}
            requester={requester}
            onClose={() => setExtraSetting(null)}
            onDeleteAccount={onDeleteAccount}
          />
        </ThemedScrollbarContainer>
      </AccountsContainer>
    </SettingsContainer>
  );
};

/**
 * Represents a single item in the list of accounts.
 */
const AccountListItem: React.FC<{
  account: DerivedAccount;
  activeAccountId: string;
  onSelectAccount: () => void;
  onSelectMode: (mode: Mode.ResetPassword | Mode.DeleteAccount) => void;
}> = ({ account, activeAccountId, onSelectAccount, onSelectMode }) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <>
      <ParentAccountsListItemContainer>
        <ParentAccountDetails onClick={onSelectAccount}>
          {account.alias}
          {activeAccountId === account.id && <span>(selected)</span>}
        </ParentAccountDetails>

        <ParentAccountSideButton onClick={() => setExpanded(!expanded)} />
      </ParentAccountsListItemContainer>

      {expanded && (
        <ModeSelect
          type={account.type}
          onSelectMode={(mode) => {
            setExpanded(false);
            onSelectMode(mode);
          }}
        />
      )}
    </>
  );
};

/**
 * Contains a list of possible settings to open for a given account.
 */
const ModeSelect: React.FC<{
  onSelectMode: (mode: Mode.ResetPassword | Mode.DeleteAccount) => void;
  type: AccountType;
}> = ({ onSelectMode, type }) => {
  const modes = type === AccountType.Ledger
    ? [Mode.DeleteAccount] as const
    : [Mode.ResetPassword, Mode.DeleteAccount] as const;

  return (
    <ModeSelectContainer>
      {modes.map((mode, i) => (
        <ModeSelectLink key={i} onClick={() => onSelectMode(mode)}>
          {mode}
        </ModeSelectLink>
      ))}
    </ModeSelectContainer>
  );
};

export default Settings;
