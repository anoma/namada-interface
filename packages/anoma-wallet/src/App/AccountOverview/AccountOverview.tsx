import { useContext, useEffect } from "react";
import { PersistGate } from "redux-persist/integration/react";
import { useNavigate } from "react-router-dom";
import { Persistor } from "redux-persist/lib/types";

import { useAppDispatch, useAppSelector } from "store";
import { addAccount } from "slices/accounts";
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
  const context = useContext(AppContext);
  const { initialAccount } = context;

  useEffect(() => {
    if (initialAccount) {
      dispatch(addAccount(initialAccount));
    }
  }, [initialAccount]);

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
