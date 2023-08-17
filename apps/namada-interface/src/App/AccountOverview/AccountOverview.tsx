import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BigNumber from "bignumber.js";

import { chains } from "@namada/chains";
import {
  useIntegrationConnection,
  useUntilIntegrationAttached,
} from "@namada/hooks";
import { Account, ExtensionKey, Extensions } from "@namada/types";
import { formatCurrency } from "@namada/utils";
import {
  Button,
  ButtonVariant,
  Heading,
  HeadingLevel,
} from "@namada/components";

import { useAppSelector, useAppDispatch } from "store";
import { AccountsState, addAccounts, fetchBalances } from "slices/accounts";
import { setIsConnected, SettingsState } from "slices/settings";
import { TopLevelRoute } from "App/types";
import { DerivedAccounts } from "./DerivedAccounts";
import {
  AccountOverviewContainer,
  AccountOverviewContent,
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

//TODO: move to utils when we have one
const isEmptyObject = (object: Record<string, unknown>): boolean => {
  return Object.keys(object).length === 0;
};

export const AccountOverview = (): JSX.Element => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isExtensionConnected, setIsExtensionConnected] = useState<
    Record<ExtensionKey, boolean>
  >({
    namada: false,
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

  const extensionAttachStatus = useUntilIntegrationAttached(chain);
  const currentExtensionAttachStatus =
    extensionAttachStatus[chain.extension.id];

  const [total, setTotal] = useState(new BigNumber(0));

  const handleDownloadExtension = (url: string): void => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleConnectExtension = async (): Promise<void> => {
    withConnection(
      async () => {
        const accounts = await integration?.accounts();
        if (accounts) {
          dispatch(addAccounts(accounts as Account[]));
          dispatch(fetchBalances());
          dispatch(setIsConnected(chainId));
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
      <AccountOverviewContent>
        <HeadingContainer>
          <div>
            <Heading level={HeadingLevel.Four}>Your wallet</Heading>
            <TotalHeading>
              <Heading level={HeadingLevel.One}>Total Balance</Heading>
            </TotalHeading>
          </div>
          <TotalContainer>
            {!isEmptyObject(derived[chainId]) && (
              <TotalAmount>
                <TotalAmountFiat>{fiatCurrency}</TotalAmountFiat>
                <TotalAmountValue>
                  {formatCurrency(fiatCurrency, total)}
                </TotalAmountValue>
              </TotalAmount>
            )}
          </TotalContainer>
        </HeadingContainer>

        {!isEmptyObject(derived[chainId]) ? (
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
        {isEmptyObject(derived[chainId]) && (
          <NoAccountsContainer>
            {!isExtensionConnected[chain.extension.id] && (
              <Button
                variant={ButtonVariant.Contained}
                onClick={
                  currentExtensionAttachStatus === "attached"
                    ? handleConnectExtension
                    : handleDownloadExtension.bind(null, chain.extension.url)
                }
                loading={
                  currentExtensionAttachStatus === "pending" ||
                  isConnectingToExtension
                }
                style={
                  currentExtensionAttachStatus === "pending"
                    ? { color: "transparent" }
                    : {}
                }
              >
                {currentExtensionAttachStatus === "attached" ||
                  currentExtensionAttachStatus === "pending"
                  ? `Connect to ${extensionAlias} Extension`
                  : "Click to download the extension"}
              </Button>
            )}
          </NoAccountsContainer>
        )}
        <DerivedAccounts setTotal={setTotal} />
      </AccountOverviewContent>
    </AccountOverviewContainer>
  );
};
