import { useEffect } from "react";
import { PersistGate } from "redux-persist/integration/react";
import { useNavigate } from "react-router-dom";
import { Persistor } from "redux-persist/lib/types";

import { useAppDispatch, useAppSelector } from "store";
import { AccountsState, submitInitAccountTransaction } from "slices/accounts";
import { SettingsState } from "slices/settings";
import { TransfersState } from "slices/transfers";
import { TopLevelRoute } from "App/types";

import { DerivedAccounts } from "./DerivedAccounts";
import { NavigationContainer } from "components/NavigationContainer";
import { Heading, HeadingLevel } from "components/Heading";
import { Button, ButtonVariant } from "components/Button";
import { AccountOverviewContainer } from "./AccountOverview.components";

type Props = {
  persistor: Persistor;
};

export const AccountOverview = ({ persistor }: Props): JSX.Element => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isTransferSubmitting } = useAppSelector<TransfersState>(
    (state) => state.transfers
  );
  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);
  const { chainId } = useAppSelector<SettingsState>((state) => state.settings);

  const derivedAccounts = derived[chainId] || {};
  const accounts = Object.values(derivedAccounts);

  // Collect uninitialized accounts
  const uninitializedAccounts = accounts.filter(
    (account) => !account.establishedAddress && !account.isInitializing
  );

  useEffect(() => {
    // Initialize any uninitialized accounts
    if (uninitializedAccounts.length > 0) {
      uninitializedAccounts.forEach((account) => {
        dispatch(submitInitAccountTransaction(account));
      });
    }
  }, [uninitializedAccounts]);

  return (
    <AccountOverviewContainer>
      <NavigationContainer>
        <Heading level={HeadingLevel.One}>Accounts</Heading>
      </NavigationContainer>
      <Button
        variant={ButtonVariant.Contained}
        onClick={() => navigate(TopLevelRoute.WalletAddAccount)}
      >
        Add Account
      </Button>
      {isTransferSubmitting && <p>Transfer is in progress</p>}
      <PersistGate loading={"Loading accounts..."} persistor={persistor}>
        <DerivedAccounts />
      </PersistGate>
    </AccountOverviewContainer>
  );
};
