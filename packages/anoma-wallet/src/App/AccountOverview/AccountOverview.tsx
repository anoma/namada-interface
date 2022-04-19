import { useContext, useEffect } from "react";
import { PersistGate } from "redux-persist/integration/react";
import { useNavigate } from "react-router-dom";
import { Persistor } from "redux-persist/lib/types";

import { useAppDispatch, useAppSelector } from "store";
import {
  AccountsState,
  addAccount,
  submitInitAccountTransaction,
} from "slices/accounts";
import { TransfersState } from "slices/transfers";
import { TopLevelRoute } from "App/types";

import { DerivedAccounts } from "./DerivedAccounts";
import { NavigationContainer } from "components/NavigationContainer";
import { Heading, HeadingLevel } from "components/Heading";
import { Button, ButtonVariant } from "components/Button";
import { AccountOverviewContainer } from "./AccountOverview.components";
import { AppContext } from "App/App";

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

  const context = useContext(AppContext);
  const { initialAccount } = context;

  const accounts = Object.values(derived);

  // Collect uninitialized accounts
  const uninitializedAccounts = accounts.filter(
    (account) => !account.establishedAddress && !account.isInitializing
  );

  useEffect(() => {
    if (initialAccount && accounts.length === 0) {
      dispatch(addAccount(initialAccount));
    }

    if (uninitializedAccounts.length > 0) {
      uninitializedAccounts.forEach((account) => {
        dispatch(submitInitAccountTransaction(account));
      });
    }
  }, []);

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
