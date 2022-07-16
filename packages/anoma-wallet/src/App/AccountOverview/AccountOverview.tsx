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
  NoAccountsContainer,
  TotalAmount,
  TotalAmountFiat,
  TotalAmountValue,
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

  const { derived, shieldedAccounts } = useAppSelector<AccountsState>(
    (state) => state.accounts
  );
  const currency = useAppSelector<SettingsState>(
    (state) => state.settings.fiatCurrency
  );

  const { chainId } = useAppSelector<SettingsState>((state) => state.settings);

  const [total, setTotal] = useState(0);

  const derivedAccounts = derived[chainId] || {};
  const accounts = Object.values(derivedAccounts);

  // Collect uninitialized transparent accounts
  const uninitializedAccounts = accounts.filter(
    (account) => !account.establishedAddress && !account.isInitializing
  );

  useEffect(() => {
    // Initialize accounts sequentially
    // Each rerender will initialize the next in this batch
    if (uninitializedAccounts.length > 0) {
      dispatch(submitInitAccountTransaction(uninitializedAccounts[0]));
    }
  }, [uninitializedAccounts]);

  return (
    <AccountOverviewContainer>
      <PersistGate loading={"Loading accounts..."} persistor={persistor}>
        <AccountTabsContainer>
          <AccountTab className={"active"}>Fungible</AccountTab>
          <AccountTab className={"disabled"}>Non-Fungible</AccountTab>
        </AccountTabsContainer>
        <AccountOverviewContent>
          <HeadingContainer>
            <div>
              <Heading level={HeadingLevel.Four}>Your wallet</Heading>
              <TotalHeading>
                <Heading level={HeadingLevel.One}>Total Balance</Heading>
              </TotalHeading>
            </div>
            <TotalContainer>
              {(derived[chainId] || shieldedAccounts[chainId]) && (
                <TotalAmount>
                  <TotalAmountFiat>{currency}</TotalAmountFiat>
                  <TotalAmountValue>{total}</TotalAmountValue>
                </TotalAmount>
              )}
            </TotalContainer>
          </HeadingContainer>

          {derived[chainId] || shieldedAccounts[chainId] ? (
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
          ) : (
            <div />
          )}
          {!derived[chainId] && !shieldedAccounts[chainId] && (
            <NoAccountsContainer>
              <p>You have no accounts on this chain!</p>

              <Button
                variant={ButtonVariant.Contained}
                onClick={() => navigate(TopLevelRoute.WalletAddAccount)}
              >
                Create an Account
              </Button>
            </NoAccountsContainer>
          )}
          <DerivedAccounts setTotal={setTotal} />
        </AccountOverviewContent>
      </PersistGate>
    </AccountOverviewContainer>
  );
};
