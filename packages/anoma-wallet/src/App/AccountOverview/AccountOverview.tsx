import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import { useNavigate } from "react-router-dom";

import { NavigationContainer } from "components/NavigationContainer";
import { Heading, HeadingLevel } from "components/Heading";
import { AccountOverviewContainer } from "./AccountOverview.components";
import { useAppSelector, store } from "store";
import { DerivedAccounts } from "./DerivedAccounts";
import { Button, ButtonVariant } from "components/Button";
import { TopLevelRoute } from "App/types";

const persistor = persistStore(store);

export const AccountOverview = (): JSX.Element => {
  const { derived } = useAppSelector((state) => state.accounts);
  const navigate = useNavigate();

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
