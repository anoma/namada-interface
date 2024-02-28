import { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";

import { Alert, Stack } from "@namada/components";
import { DerivedAccount } from "@namada/types";
import { useAccountContext, useVaultContext } from "context";
import { useQuery } from "hooks";
import { useRequester } from "hooks/useRequester";
import {
  CheckDurabilityMsg,
  FetchAndStoreMaspParamsMsg,
  HasMaspParamsMsg,
} from "provider/messages";
import { Ports } from "router";
import { openSetupTab } from "utils";
import {
  DeleteAccount,
  RenameAccount,
  ViewAccount,
  ViewMnemonic,
} from "./Accounts";
import { ParentAccounts } from "./Accounts/ParentAccounts";
import { ChangePassword, ConnectedSites, Network } from "./Settings";
import { Setup } from "./Setup";
import routes from "./routes";
import { LoadingStatus } from "./types";

const STORE_DURABILITY_INFO =
  'Store is not durable. This might cause problems when persisting data on disk.\
 To fix this issue, please navigate to "about:config" and set "dom.indexedDB.experimental" to true.';

export const AppContent = (): JSX.Element => {
  const { accounts, status: accountLoadingStatus } = useAccountContext();
  const { passwordInitialized } = useVaultContext();

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
    return accounts.length === 0 ? routes.setup() : routes.viewAccountList();
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
    if (
      !passwordInitialized &&
      accountLoadingStatus === LoadingStatus.Completed
    ) {
      openSetupTab();
      return;
    }

    if (accountLoadingStatus === LoadingStatus.Completed) {
      navigate(getStartPage(accounts));
    }
  }, [accounts, passwordInitialized, accountLoadingStatus]);

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
    <Stack className="py-5" full gap={6}>
      {isDurable === false && (
        <Alert type="warning">{STORE_DURABILITY_INFO}</Alert>
      )}

      {maspStatus.status === LoadingStatus.Completed && maspStatus.info && (
        <Alert title="MASP Status" type="warning">
          {maspStatus.info}
        </Alert>
      )}

      <Routes>
        <Route path={"/"} element={<></>} />
        <Route path={routes.setup()} element={<Setup />} />
        <Route path={routes.connectedSites()} element={<ConnectedSites />} />
        <Route
          path={routes.changePassword()}
          element={
            <ChangePassword
              onComplete={() => navigate(getStartPage(accounts))}
            />
          }
        />
        <Route path={routes.network()} element={<Network />} />
        {/* Routes that depend on a parent account existing in storage */}
        {accounts.length > 0 && (
          <>
            <Route path={routes.deleteAccount()} element={<DeleteAccount />} />
            <Route path={routes.viewAccount()} element={<ViewAccount />} />
            <Route path={routes.renameAccount()} element={<RenameAccount />} />
            <Route
              path={routes.viewAccountMnemonic()}
              element={<ViewMnemonic />}
            />
            <Route
              path={routes.viewAccountList()}
              element={<ParentAccounts />}
            />
          </>
        )}
      </Routes>
    </Stack>
  );
};
