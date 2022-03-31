import { PersistGate } from "redux-persist/integration/react";
import { useNavigate } from "react-router-dom";
import { Persistor } from "redux-persist/lib/types";
import { NavigationContainer } from "components/NavigationContainer";
import { Heading, HeadingLevel } from "components/Heading";
import { Button, ButtonVariant } from "components/Button";
import { AccountOverviewContainer } from "./AccountOverview.components";
import { useAppDispatch, useAppSelector } from "store";
import { DerivedAccounts } from "./DerivedAccounts";
import { addAccount, DerivedAccountsState } from "slices/accounts";
import { TopLevelRoute } from "App/types";
import { useContext, useEffect } from "react";
import { AppContext } from "App/App";

type Props = {
  persistor: Persistor;
};

export const AccountOverview = ({ persistor }: Props): JSX.Element => {
  const { derived } = useAppSelector<DerivedAccountsState>(
    (state) => state.accounts
  );
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const context = useContext(AppContext);
  const { initialAccount } = context;

  useEffect(() => {
    if (initialAccount) {
      dispatch(addAccount(initialAccount));
    }
  }, [initialAccount, dispatch]);

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
      <PersistGate loading={"Loading accounts..."} persistor={persistor}>
        <DerivedAccounts derived={derived} />
      </PersistGate>
    </AccountOverviewContainer>
  );
};
