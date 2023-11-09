import { useEffect, useState } from "react";
import { Outlet, Route, Routes, useNavigate } from "react-router-dom";

import { Alert, Loading } from "@namada/components";
import { DerivedAccount } from "@namada/types";
import { formatRouterPath } from "@namada/utils";
import { GetActiveAccountMsg } from "background/keyring";
import { useQuery } from "hooks";
import { useRequester } from "hooks/useRequester";
import {
  CheckDurabilityMsg,
  FetchAndStoreMaspParamsMsg,
  HasMaspParamsMsg,
  QueryAccountsMsg,
} from "provider/messages";
import { Ports } from "router";
import { AddAccount, DeleteAccount, ViewAccount } from "./Accounts";
import { ParentAccounts } from "./Accounts/ParentAccounts";
import { ContentContainer } from "./App.components";
import { ConnectedSites } from "./ConnectedSites";
import { Setup } from "./Setup";
import { AccountManagementRoute, LoadingStatus, TopLevelRoute } from "./types";

const STORE_DURABILITY_INFO =
  'Store is not durable. This might cause problems when persisting data on disk.\
 To fix this issue, please navigate to "about:config" and set "dom.indexedDB.experimental" to true.';

type AppContentParams = {
  onLockApp: () => void;
};

export const AppContent = ({ onLockApp }: AppContentParams): JSX.Element => {
  const query = useQuery();
  const redirect = query.get("redirect");
  const navigate = useNavigate();
  const requester = useRequester();

  const [isLocked, setIsLocked] = useState(true);
  const [isDurable, setIsDurable] = useState<boolean | undefined>();
  const [status, setStatus] = useState<LoadingStatus>();
  const [accounts, setAccounts] = useState<DerivedAccount[]>([]);
  const [parentAccount, setParentAccount] = useState<DerivedAccount>();
  const [error, setError] = useState("");
  const [loadingStatus, setLoadingStatus] = useState("");
  const [maspStatus, setMaspStatus] = useState<{
    status: LoadingStatus;
    info: string;
  }>({ status: LoadingStatus.Completed, info: "" });

  const fetchAccounts = async (): Promise<DerivedAccount[]> => {
    setLoadingStatus("Loading accounts...");
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
      setLoadingStatus("");
    }
    return [];
  };

  const fetchParentAccountId = async (): Promise<void> => {
    setLoadingStatus("Loading parent...");
    setStatus(LoadingStatus.Pending);
    try {
      const parent = await requester.sendMessage(
        Ports.Background,
        new GetActiveAccountMsg()
      );
      const parentAccount = accounts.find(
        (account) => account.id === parent?.id
      );
      setParentAccount(parentAccount);
    } catch (e) {
      console.error(e);
      setError(`An error occurred while loading extension: ${e}`);
      setStatus(LoadingStatus.Failed);
    } finally {
      setStatus(LoadingStatus.Completed);
      setLoadingStatus("");
    }
  };

  // Fetch Masp params if they don't exist
  const fetchMaspParams = async (): Promise<void> => {
    const hasMaspParams = await requester.sendMessage(
      Ports.Background,
      new HasMaspParamsMsg()
    );

    if (!hasMaspParams) {
      setMaspStatus({
        status: LoadingStatus.Pending,
        info: "Fetching MASP parameters...",
      });
      try {
        await requester.sendMessage(
          Ports.Background,
          new FetchAndStoreMaspParamsMsg()
        );
        setMaspStatus({
          status: LoadingStatus.Completed,
          info: "",
        });
      } catch (e) {
        setMaspStatus({
          status: LoadingStatus.Failed,
          info: `Fetching MASP parameters failed: ${e}`,
        });
        //TODO: Notify user in a better way
        console.error(e);
      }
    }
  };

  const getStartPage = (accounts: DerivedAccount[]): string => {
    if (accounts.length === 0) {
      return formatRouterPath([TopLevelRoute.Setup]);
    } else {
      return formatRouterPath([
        TopLevelRoute.Accounts,
        AccountManagementRoute.ViewAccounts,
      ]);
    }
  };

  const onDeleteKey = async (): Promise<void> => {
    const accounts = await fetchAccounts();
    navigate(getStartPage(accounts));
  };

  useEffect(() => {
    if (status === LoadingStatus.Completed) {
      fetchMaspParams();
    }
  }, [status]);

  // Provide a redirect in the case of transaction/connection approvals
  useEffect(() => {
    if (redirect) {
      navigate(redirect);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (accounts.length > 0) {
      fetchParentAccountId();
    }
  }, [accounts]);

  useEffect(() => {
    if (status === LoadingStatus.Completed) {
      navigate(getStartPage(accounts));
    }
  }, [status, parentAccount]);

  useEffect(() => {
    (async () => {
      const isDurable = await requester.sendMessage(
        Ports.Background,
        new CheckDurabilityMsg()
      );
      setIsDurable(isDurable);
    })();
  }, []);

  return (
    <ContentContainer>
      <Loading status={loadingStatus} visible={!!loadingStatus} />
      {isDurable === false && (
        <Alert type="warning">{STORE_DURABILITY_INFO}</Alert>
      )}

      {maspStatus.status === LoadingStatus.Completed && maspStatus.info && (
        <Alert title="MASP Status" type="warning">
          {maspStatus.info}
        </Alert>
      )}

      {error && (
        <Alert title="Error" type="error">
          {error}
        </Alert>
      )}

      <Routes>
        <Route path={TopLevelRoute.Setup} element={<Setup />} />
        <Route
          path={TopLevelRoute.ConnectedSites}
          element={<ConnectedSites />}
        />

        {/* Routes that depend on a parent account existing in storage */}
        {parentAccount && (
          <>
            <Route path={TopLevelRoute.Accounts} element={<Outlet />}>
              <Route
                path={AccountManagementRoute.ViewAccounts}
                element={
                  <ParentAccounts
                    onSelectAccount={fetchAccounts}
                    activeAccountId={parentAccount.id}
                    onLockApp={onLockApp}
                  />
                }
              />
              <Route
                path={AccountManagementRoute.DeleteAccount}
                element={<DeleteAccount onComplete={onDeleteKey} />}
              />
              <Route
                path={AccountManagementRoute.ViewAccount}
                element={<ViewAccount />}
              />
              <Route
                path={AccountManagementRoute.AddAccount}
                element={
                  <AddAccount
                    accounts={accounts}
                    parentAccount={parentAccount}
                    requester={requester}
                    setAccounts={setAccounts}
                    isLocked={isLocked}
                    unlockKeyRing={() => setIsLocked(false)}
                  />
                }
              />
            </Route>
          </>
        )}
      </Routes>
    </ContentContainer>
  );
};
