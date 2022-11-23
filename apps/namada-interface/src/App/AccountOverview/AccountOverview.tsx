import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Anoma } from "@anoma/integrations";
import { useAppSelector, useAppDispatch } from "store";
import { AccountsState, addAccounts } from "slices/accounts";
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
  ButtonsContainer,
  ButtonsWrapper,
  HeadingContainer,
  NoAccountsContainer,
  TotalAmount,
  TotalAmountFiat,
  TotalAmountValue,
  TotalContainer,
  TotalHeading,
} from "./AccountOverview.components";
import { formatCurrency } from "@anoma/utils";

export const AccountOverview = (): JSX.Element => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isExtensionConnected, setIsExtensionConnected] = useState(false);
  const [isConnectingToExtension, setIsConnectingToExtension] = useState(false);

  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);

  const { chainId, fiatCurrency } = useAppSelector<SettingsState>(
    (state) => state.settings
  );
  const [total, setTotal] = useState(0);

  const handleConnectExtension = async (): Promise<void> => {
    try {
      const anoma = new Anoma();
      if (anoma.detect()) {
        setIsConnectingToExtension(true);
        await anoma.connect();
        const accounts = await anoma.fetchAccounts();
        if (accounts) {
          dispatch(addAccounts(accounts));
        }
        setIsExtensionConnected(true);
      }
    } catch (e) {
      setIsExtensionConnected(false);
      setIsConnectingToExtension(false);
    }
  };

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
            {derived[chainId] && (
              <TotalAmount>
                <TotalAmountFiat>{fiatCurrency}</TotalAmountFiat>
                <TotalAmountValue>
                  {formatCurrency(fiatCurrency, total)}
                </TotalAmountValue>
              </TotalAmount>
            )}
          </TotalContainer>
        </HeadingContainer>

        {derived[chainId] ? (
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
        {!derived[chainId] && (
          <NoAccountsContainer>
            {!isExtensionConnected && (
              <Button
                variant={ButtonVariant.Contained}
                onClick={handleConnectExtension}
                loading={isConnectingToExtension}
              >
                Connect to Extension
              </Button>
            )}
          </NoAccountsContainer>
        )}
        <DerivedAccounts setTotal={setTotal} />
      </AccountOverviewContent>
    </AccountOverviewContainer>
  );
};
