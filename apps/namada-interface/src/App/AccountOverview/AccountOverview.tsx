import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { chains } from "@anoma/chains";
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
import { useIntegrationConnection } from "services";
import { Account, ExtensionKey, Extensions } from "@anoma/types";

export const AccountOverview = (): JSX.Element => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isExtensionConnected, setIsExtensionConnected] = useState<
    Record<ExtensionKey, boolean>
  >({
    anoma: false,
    keplr: false,
    metamask: false,
  });

  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);

  const { chainId, fiatCurrency } = useAppSelector<SettingsState>(
    (state) => state.settings
  );

  const [integration, isConnectingToExtension, withConnection] =
    useIntegrationConnection(chainId);
  const chain = chains[chainId];
  const extensionAlias = Extensions[chain.extension.id].alias;

  const [total, setTotal] = useState(0);

  const handleConnectExtension = async (): Promise<void> => {
    withConnection(
      async () => {
        const accounts = await integration?.accounts();
        if (accounts) {
          dispatch(addAccounts(accounts as Account[]));
        }
        setIsExtensionConnected({
          ...isExtensionConnected,
          [chain.extension.id]: true,
        });
      },
      async () => {
        setIsExtensionConnected({
          ...isExtensionConnected,
          [chain.extension.id]: false,
        });
      }
    );
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
            {!isExtensionConnected[chain.extension.id] && (
              <Button
                variant={ButtonVariant.Contained}
                onClick={handleConnectExtension}
                loading={isConnectingToExtension}
              >
                Connect to {extensionAlias} Extension
              </Button>
            )}
          </NoAccountsContainer>
        )}
        <DerivedAccounts setTotal={setTotal} />
      </AccountOverviewContent>
    </AccountOverviewContainer>
  );
};
