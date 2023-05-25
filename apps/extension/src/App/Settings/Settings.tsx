import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import browser from "webextension-polyfill";

import { DerivedAccount } from "@anoma/types";
import { Button, ButtonVariant } from "@anoma/components";
import { assertNever } from "@anoma/utils";

import { ExtensionRequester } from "extension";
import { Ports } from "router";
import {
  LockKeyRingMsg,
  SetActiveAccountMsg,
  QueryParentAccountsMsg,
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
import {
  ResetPassword,
  Props as ResetPasswordProps
} from "./ExtraSettings/ResetPassword"
import { ExtraSettings } from "./ExtraSettings";
import { Mode, ExtraSetting } from "./ExtraSettings/types";

/**
 * Represents the extension's settings page.
 */
const Settings: React.FC<{
  activeAccountId: string;
  requester: ExtensionRequester;
  onSelectAccount: (account: DerivedAccount) => void;
}> = ({
  activeAccountId,
  requester,
  onSelectAccount,
}) => {
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

  const handleSelectAccount = async (account: DerivedAccount): Promise<void> => {
    const { id } = account;
    try {
      await requester.sendMessage(
        Ports.Background,
        new SetActiveAccountMsg(id)
      );

      // Lock current wallet keyring:
      await requester.sendMessage(Ports.Background, new LockKeyRingMsg());

      // Fetch accounts for selected parent account
      await onSelectAccount(account);
    } catch (e) {
      console.error(e);
      setError(`An error occurred while setting active account: ${e}`);
      setStatus(Status.Failed);
    }
  };

  return (
    <SettingsContainer>
      <AccountsContainer>
        <ThemedScrollbarContainer>

          {status === Status.Failed && (
            <p>Error communicating with extension background!</p>
          )}
          <p>{error ? error : "Select account:"}</p>

          <ParentAccountsList>
            {parentAccounts.map((account, i) =>
              <AccountListItem
                key={i}
                account={account}
                activeAccountId={activeAccountId}
                onSelectAccount={() => handleSelectAccount(account)}
                onSelectMode={(mode) => setExtraSetting({
                  mode,
                  accountId: account.id
                })}
              />
            )}
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

          <ExtraSettings
            extraSetting={extraSetting}
            requester={requester}
            onClose={() => setExtraSetting(null)}
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
  onSelectMode: (mode: Mode) => void;
}> = ({
  account,
  activeAccountId,
  onSelectAccount,
  onSelectMode,
}) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <>
      <ParentAccountsListItemContainer>
        <ParentAccountDetails
          onClick={onSelectAccount}
        >
          {account.alias}
          {activeAccountId === account.id && <span>(selected)</span>}
        </ParentAccountDetails>

        <ParentAccountSideButton
          onClick={() => setExpanded(!expanded)}
        />
      </ParentAccountsListItemContainer>

      {expanded &&
        <ModeSelect
          onSelectMode={(mode) => {
            setExpanded(false);
            onSelectMode(mode);
          }}
        />
      }
    </>
  );
};

/**
 * Contains a list of possible settings to open for a given account.
 */
const ModeSelect: React.FC<{
  onSelectMode: (mode: Mode) => void;
}> = ({
  onSelectMode,
}) => {
  const modes = [
    Mode.ResetPassword,
  ];

  return (
    <ModeSelectContainer>
      {modes.map((mode, i) =>
        <ModeSelectLink
          key={i}
          onClick={() => onSelectMode(mode)}
        >
          {mode}
        </ModeSelectLink>
      )}
    </ModeSelectContainer>
  );
};

export default Settings;
