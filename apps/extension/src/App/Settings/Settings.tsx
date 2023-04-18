import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { DerivedAccount } from "@anoma/types";
import { Button, ButtonVariant } from "@anoma/components";

import { ExtensionRequester } from "extension";
import { Ports } from "router";
import { QueryAccountsMsg } from "provider/messages";
import { SetActiveAccountMsg } from "background/keyring";
import { SettingsContainer } from "./Settings.components";
import { TopLevelRoute } from "../types";
import { Status } from "../App";

type Props = {
  requester: ExtensionRequester;
};

const Settings: React.FC<Props> = ({ requester }) => {
  const navigate = useNavigate();
  const [parentAccounts, setParentAccounts] = useState<DerivedAccount[]>([]);
  const [status, setStatus] = useState<Status>();
  const [error, setError] = useState("");

  const fetchParentAccounts = async (): Promise<void> => {
    setStatus(Status.Pending);
    try {
      const accounts = await requester.sendMessage(
        Ports.Background,
        // TODO: Query parent accounts instead!
        new QueryAccountsMsg()
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
    } catch (e) {
      console.error(e);
      setError(`An error occurred while setting active account: ${e}`);
      setStatus(Status.Failed);
    }

    return;
  };

  return (
    <SettingsContainer>
      <h1>Settings</h1>
      {status === Status.Failed && (
        <p>Error communicating with extension background!</p>
      )}
      {error && <p>{error}</p>}
      <h4>Select account:</h4>
      {parentAccounts.length > 0 &&
        parentAccounts.map((account, i: number) => (
          <Button
            variant={ButtonVariant.Outlined}
            key={i}
            onClick={() => handleSetParentAccount(account.id)}
          >
            {account.alias}
          </Button>
        ))}
      <Button
        variant={ButtonVariant.Contained}
        onClick={() => navigate(TopLevelRoute.Accounts)}
      >
        Back
      </Button>
    </SettingsContainer>
  );
};

export default Settings;
