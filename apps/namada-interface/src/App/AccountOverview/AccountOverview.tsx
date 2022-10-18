import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAppSelector } from "store";
import { AccountsState } from "slices/accounts";
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
import { formatCurrency } from "@anoma/utils";

export const AccountOverview = (): JSX.Element => {
  const navigate = useNavigate();

  const { derived, shieldedAccounts } = useAppSelector<AccountsState>(
    (state) => state.accounts
  );

  const { chainId, fiatCurrency } = useAppSelector<SettingsState>(
    (state) => state.settings
  );
  const [total, setTotal] = useState(0);

  return (
    <AccountOverviewContainer>
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
                <TotalAmountFiat>{fiatCurrency}</TotalAmountFiat>
                <TotalAmountValue>
                  {formatCurrency(fiatCurrency, total)}
                </TotalAmountValue>
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
          </NoAccountsContainer>
        )}
        <DerivedAccounts setTotal={setTotal} />
      </AccountOverviewContent>
    </AccountOverviewContainer>
  );
};
