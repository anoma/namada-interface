import { createContext, useEffect, useState } from "react";

import { DerivedAccount } from "@namada/types";
import { LoadingStatus } from "App/types";
import {
  DeleteAccountMsg,
  GetActiveAccountMsg,
  ParentAccount,
  SetActiveAccountMsg,
} from "background/keyring";
import { useRequester } from "hooks/useRequester";
import { QueryAccountsMsg } from "provider";
import { Ports } from "router";

type AccountContextProps = {
  children: JSX.Element;
};

type AccountContextType = {
  accounts: DerivedAccount[];
  parentAccounts: DerivedAccount[];
  activeAccountId: string | undefined;
  error: string;
  status: LoadingStatus | undefined;
  remove: (accountId: string) => Promise<void>;
  fetchAll: () => Promise<DerivedAccount[]>;
  changeActiveAccountId: (
    accountId: string,
    accountType: ParentAccount
  ) => void;
};

// This initializer
const createAccountContext = (): AccountContextType => ({
  accounts: [],
  parentAccounts: [],
  activeAccountId: undefined,
  error: "",
  status: undefined,
  remove: async (_accountId: string) => {},
  fetchAll: async () => [],
  changeActiveAccountId: (
    _accountId: string,
    _accountType: ParentAccount
  ) => {},
});

export const AccountContext = createContext<AccountContextType>(
  createAccountContext()
);

export const AccountContextWrapper = ({
  children,
}: AccountContextProps): JSX.Element => {
  const requester = useRequester();
  const [accounts, setAccounts] = useState<DerivedAccount[]>([]);
  const [parentAccounts, setParentAccounts] = useState<DerivedAccount[]>([]);
  const [activeAccountId, setActiveAccountId] = useState<string | undefined>();
  const [status, setStatus] = useState<LoadingStatus | undefined>();
  const [error, setError] = useState("");

  const fetchAll = async (): Promise<DerivedAccount[]> => {
    setStatus(LoadingStatus.Pending);
    try {
      const accounts = await requester.sendMessage(
        Ports.Background,
        new QueryAccountsMsg()
      );
      setAccounts(accounts);
      return accounts;
    } catch (e) {
      console.error(e);
      setError(`An error occurred while loading extension: ${e}`);
      setStatus(LoadingStatus.Failed);
    } finally {
      setStatus(LoadingStatus.Completed);
    }
    return [];
  };

  const fetchActiveAccountId = async (): Promise<void> => {
    const parent = await requester.sendMessage(
      Ports.Background,
      new GetActiveAccountMsg()
    );
    parent && setActiveAccountId(parent.id);
  };

  const remove = async (accountId: string): Promise<void> => {
    await requester.sendMessage(
      Ports.Background,
      new DeleteAccountMsg(accountId)
    );

    if (accountId === activeAccountId && parentAccounts.length > 0) {
      await changeActiveAccountId(
        parentAccounts[0].id,
        parentAccounts[0].type as ParentAccount
      );
    }

    await fetchAll();
  };

  const changeActiveAccountId = (
    accountId: string,
    accountType: ParentAccount
  ): void => {
    setActiveAccountId(accountId);
    requester.sendMessage(
      Ports.Background,
      new SetActiveAccountMsg(accountId, accountType)
    );
  };

  useEffect(() => {
    fetchAll();
    fetchActiveAccountId();
  }, []);

  useEffect(() => {
    setParentAccounts(accounts.filter((account) => !account.parentId));
  }, [accounts]);

  return (
    <AccountContext.Provider
      value={{
        accounts,
        parentAccounts,
        activeAccountId,
        status,
        error,
        remove,
        fetchAll,
        changeActiveAccountId,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};
