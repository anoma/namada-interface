import { useEffect, useState } from "react";
import { PersistGate } from "redux-persist/integration/react";
import { useNavigate } from "react-router-dom";
import { Persistor } from "redux-persist/lib/types";

import { useAppDispatch, useAppSelector } from "store";
import { AccountsState, submitInitAccountTransaction } from "slices/accounts";
import { SettingsState } from "slices/settings";
import { TransfersState } from "slices/transfers";
import { TopLevelRoute } from "App/types";

import { DerivedAccounts } from "./DerivedAccounts";
import { Heading, HeadingLevel } from "components/Heading";
import { Button, ButtonVariant } from "components/Button";
import {
  AccountOverviewContainer,
  ButtonsWrapper,
  HeadingContainer,
  TotalAmount,
  TotalContainer,
  TotalHeading,
} from "./AccountOverview.components";
import { ButtonsContainer } from "App/AccountCreation/Steps/Completion/Completion.components";

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

  const [total, setTotal] = useState(0);

  const derivedAccounts = derived[chainId] || {};
  const accounts = Object.values(derivedAccounts);

  // Collect uninitialized transparent accounts
  const uninitializedAccounts = accounts.filter(
    (account) => !account.establishedAddress && !account.isInitializing
  );

  useEffect(() => {
    // Initialize any uninitialized transparent accounts
    if (uninitializedAccounts.length > 0) {
      // Initialize accounts sequentially
      // Each rerender will initialize the next in this batch
      dispatch(submitInitAccountTransaction(uninitializedAccounts[0]));
    }
  }, [uninitializedAccounts]);

  return (
    <AccountOverviewContainer>
      <PersistGate loading={"Loading accounts..."} persistor={persistor}>
        <HeadingContainer>
          <Heading level={HeadingLevel.Four}>Your wallet</Heading>
        </HeadingContainer>
        <TotalContainer>
          <TotalHeading>
            <Heading level={HeadingLevel.One}>Total Balance</Heading>
          </TotalHeading>
          <TotalAmount>{total}</TotalAmount>
        </TotalContainer>

        <ButtonsContainer>
          <ButtonsWrapper>
            <Button
              variant={ButtonVariant.Contained}
              onClick={() => navigate(TopLevelRoute.TokenSend)}
            >
              Send
            </Button>
            <Button
              variant={ButtonVariant.Contained}
              onClick={() => navigate(TopLevelRoute.TokenReceive)}
            >
              Receive
            </Button>
          </ButtonsWrapper>
        </ButtonsContainer>

        {isTransferSubmitting && <p>Transfer is in progress</p>}

        <DerivedAccounts setTotal={setTotal} />
      </PersistGate>
    </AccountOverviewContainer>
  );
};
