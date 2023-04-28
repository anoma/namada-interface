import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import browser from "webextension-polyfill";

import { DerivedAccount } from "@anoma/types";
import { Button, ButtonVariant } from "@anoma/components";
import { defaultChainId } from "@anoma/chains";

import { ExtensionRequester } from "extension";
import { Ports } from "router";
import {
  LockKeyRingMsg,
  SetActiveAccountMsg,
  QueryParentAccountsMsg,
} from "background/keyring";
import { AccountChangedEvent } from "background/content";
import {
  SettingsContainer,
  ButtonsContainer,
  ParentAccountsList,
  ParentAccountsListItem,
  ParentAccountDetails,
} from "./Settings.components";
import {
  AccountsContainer,
  ThemedScrollbarContainer,
} from "../Accounts/Accounts.components";
import { TopLevelRoute } from "../types";
import { Status } from "../App";

type Props = {
  requester: ExtensionRequester;
  fetchAccounts: () => Promise<void>;
  parentId?: string;
};

const Settings: React.FC<Props> = ({ requester, fetchAccounts, parentId }) => {
  const navigate = useNavigate();
  const [parentAccounts, setParentAccounts] = useState<DerivedAccount[]>([]);
  const [status, setStatus] = useState<Status>();
  const [error, setError] = useState("");

  const fetchParentAccounts = async (): Promise<void> => {
    setStatus(Status.Pending);
    try {
      const accounts = await requester.sendMessage(
        Ports.Background,
        new QueryParentAccountsMsg()
      );
      setParentAccounts(accounts);
    } catch (e) {
      console.error(e);
      setError(`An error occurred while loading extension: ${e}`);
      setStatus(Status.Failed);
    } finally {
      setStatus(Status.Completed);
    }
  };

  useEffect(() => {
    fetchParentAccounts();
  }, []);

  const handleSetParentAccount = async (id: string): Promise<void> => {
    try {
      await requester.sendMessage(
        Ports.Background,
        new SetActiveAccountMsg(id)
      );

      // Dispatch event notifying interface of parent-account change
      // TODO: Debug the following (results in failure)
      await requester.sendMessage(
        Ports.Background,
        new AccountChangedEvent(defaultChainId)
      );

      // Lock current wallet keyring:
      await requester.sendMessage(Ports.Background, new LockKeyRingMsg());

      // Fetch accounts for selected parent account
      await fetchAccounts();
    } catch (e) {
      console.error(e);
      setError(`An error occurred while setting active account: ${e}`);
      setStatus(Status.Failed);
    }

    return;
  };

  return (
    <SettingsContainer>
      <AccountsContainer>
        <ThemedScrollbarContainer>
          {status === Status.Failed && (
            <p>Error communicating with extension background!</p>
          )}
          {error && <p>{error}</p>}
          {!error && <p>Select account:</p>}
          <ParentAccountsList>
            {parentAccounts.length > 0 &&
              parentAccounts.map((account, i: number) => (
                <ParentAccountsListItem key={i}>
                  <ParentAccountDetails
                    onClick={() => handleSetParentAccount(account.id)}
                  >
                    {account.alias}
                    {parentId === account.id && <span>(selected)</span>}
                  </ParentAccountDetails>
                </ParentAccountsListItem>
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
        </ThemedScrollbarContainer>
      </AccountsContainer>
    </SettingsContainer>
  );
};

export default Settings;
