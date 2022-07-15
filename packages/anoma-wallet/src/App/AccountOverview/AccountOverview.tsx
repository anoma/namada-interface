import { useEffect, useState } from "react";
import { PersistGate } from "redux-persist/integration/react";
import { useNavigate } from "react-router-dom";
import { Persistor } from "redux-persist/lib/types";

import { useAppDispatch, useAppSelector } from "store";
import { AccountsState, submitInitAccountTransaction } from "slices/accounts";
import { SettingsState } from "slices/settings";
import { TopLevelRoute } from "App/types";

import { DerivedAccounts } from "./DerivedAccounts";
import { Heading, HeadingLevel } from "components/Heading";
import { Button, ButtonVariant } from "components/Button";
import {
  AccountOverviewContainer,
  AccountOverviewContent,
  AccountTab,
  AccountTabsContainer,
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
    // The number of uninitialized accounts should be 1 at most

    // Initialize accounts sequentially
    // Each rerender will initialize the next in this batch

    if (uninitializedAccounts.length > 0) {
      // Set time-out to clear any transitional animations
      dispatch(submitInitAccountTransaction(uninitializedAccounts[0]));
    }
  }, [uninitializedAccounts]);

  return (
    <AccountOverviewContainer>
      <AccountTabsContainer>
        <AccountTab className={"active"}>Fungible</AccountTab>
        <AccountTab className={"disabled"}>Non-Fungible</AccountTab>
      </AccountTabsContainer>
      <AccountOverviewContent>
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
          <DerivedAccounts setTotal={setTotal} />
        </PersistGate>
      </AccountOverviewContent>
    </AccountOverviewContainer>
  );
};
