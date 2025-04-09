import { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";

import { Stack } from "@namada/components";
import { DerivedAccount } from "@namada/types";
import { useAccountContext, useVaultContext } from "context";
import { useQuery } from "hooks";
import { openSetupTab } from "utils";
import {
  DeleteAccount,
  DeleteDisposableAccount,
  RenameAccount,
  UpdateRequired,
  ViewAccount,
  ViewDisposableAccount,
  ViewMnemonic,
} from "./Accounts";
import { ParentAccounts } from "./Accounts/ParentAccounts";
import { SpendingKey } from "./Accounts/SpendingKey";
import { ViewingKey } from "./Accounts/ViewingKey";
import { ChangePassword, ConnectedSites, Network } from "./Settings";
import { Warnings } from "./Settings/Warnings";
import { Setup } from "./Setup";
import routes from "./routes";
import { LoadingStatus } from "./types";

type Props = {
  warnings?: string[];
};
export const AppContent = ({ warnings }: Props): JSX.Element => {
  const { accounts, status: accountLoadingStatus } = useAccountContext();
  const { passwordInitialized } = useVaultContext();

  const query = useQuery();
  const redirect = query.get("redirect");
  const navigate = useNavigate();

  const getStartPage = (accounts: DerivedAccount[]): string => {
    return accounts.length === 0 ? routes.setup() : routes.viewAccountList();
  };

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
      void openSetupTab();
      return;
    }

    if (accountLoadingStatus === LoadingStatus.Completed) {
      navigate(getStartPage(accounts));
    }
  }, [accounts, passwordInitialized, accountLoadingStatus]);

  return (
    <Stack className="py-5 max-w-84" full gap={6}>
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
        <Route
          path={routes.warnings()}
          element={<Warnings warnings={warnings} />}
        />
        {/* Routes that depend on a parent account existing in storage */}
        {accounts.length > 0 && (
          <>
            <Route path={routes.deleteAccount()} element={<DeleteAccount />} />
            <Route path={routes.viewAccount()} element={<ViewAccount />} />
            <Route path={routes.viewViewingKey()} element={<ViewingKey />} />
            <Route path={routes.viewSpendingKey()} element={<SpendingKey />} />
            <Route path={routes.renameAccount()} element={<RenameAccount />} />
            <Route
              path={routes.viewAccountMnemonic()}
              element={<ViewMnemonic />}
            />
            <Route path={routes.viewAccountList()} element={<ParentAccounts />}>
              <Route
                path={routes.accountsUpdateRequired()}
                element={<UpdateRequired />}
              />
            </Route>

            <Route
              path={routes.viewDisposableAccount()}
              element={<ViewDisposableAccount />}
            />
            <Route
              path={routes.deleteDisposableAccount()}
              element={<DeleteDisposableAccount />}
            />
          </>
        )}
      </Routes>
    </Stack>
  );
};
