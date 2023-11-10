import { useContext, useEffect, useState } from "react";
import { Outlet, Route, Routes, useNavigate } from "react-router-dom";

import { Alert, Stack } from "@namada/components";
import { DerivedAccount } from "@namada/types";
import { formatRouterPath } from "@namada/utils";
import { AccountContext } from "context";
import { useQuery } from "hooks";
import { useRequester } from "hooks/useRequester";
import {
  CheckDurabilityMsg,
  FetchAndStoreMaspParamsMsg,
  HasMaspParamsMsg,
} from "provider/messages";
import { Ports } from "router";
import { DeleteAccount, ViewAccount } from "./Accounts";
import { ParentAccounts } from "./Accounts/ParentAccounts";
import { ConnectedSites } from "./ConnectedSites";
import { ChangePassword } from "./Settings/ChangePassword";
import { Setup } from "./Setup";
import { AccountManagementRoute, LoadingStatus, TopLevelRoute } from "./types";

const STORE_DURABILITY_INFO =
  'Store is not durable. This might cause problems when persisting data on disk.\
 To fix this issue, please navigate to "about:config" and set "dom.indexedDB.experimental" to true.';

type AppContentParams = {
  onLockApp: () => void;
};

export const AppContent = ({ onLockApp }: AppContentParams): JSX.Element => {
  const { accounts, activeAccountId } = useContext(AccountContext);
  const query = useQuery();
  const redirect = query.get("redirect");
  const navigate = useNavigate();
  const requester = useRequester();

  const [isDurable, setIsDurable] = useState<boolean | undefined>();
  const [maspStatus, setMaspStatus] = useState<{
    status: LoadingStatus;
    info: string;
  }>({ status: LoadingStatus.Completed, info: "" });

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

  useEffect(() => {
    fetchMaspParams();
  }, []);

  // Provide a redirect in the case of transaction/connection approvals
  useEffect(() => {
    if (redirect) {
      navigate(redirect);
    }
  }, []);

  useEffect(() => {
    navigate(getStartPage(accounts));
  }, [accounts, activeAccountId]);

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
    <Stack gap={6}>
      {isDurable === false && (
        <Alert type="warning">{STORE_DURABILITY_INFO}</Alert>
      )}

      {maspStatus.status === LoadingStatus.Completed && maspStatus.info && (
        <Alert title="MASP Status" type="warning">
          {maspStatus.info}
        </Alert>
      )}

      <Routes>
        <Route path={TopLevelRoute.Setup} element={<Setup />} />
        <Route
          path={TopLevelRoute.ConnectedSites}
          element={<ConnectedSites />}
        />
        <Route
          path={TopLevelRoute.ChangePassword}
          element={
            <ChangePassword
              onComplete={() => navigate(getStartPage(accounts))}
            />
          }
        />
        {/* Routes that depend on a parent account existing in storage */}
        {activeAccountId && (
          <>
            <Route path={TopLevelRoute.Accounts} element={<Outlet />}>
              <Route
                path={AccountManagementRoute.ViewAccounts}
                element={<ParentAccounts onLockApp={onLockApp} />}
              />
              <Route
                path={AccountManagementRoute.DeleteAccount}
                element={<DeleteAccount />}
              />
              <Route
                path={AccountManagementRoute.ViewAccount}
                element={<ViewAccount />}
              />
            </Route>
          </>
        )}
      </Routes>
    </Stack>
  );
};
