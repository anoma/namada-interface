import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { chains } from "@namada/chains";
import { ActionButton, Heading, Stack } from "@namada/components";
import {
  useIntegrationConnection,
  useUntilIntegrationAttached,
} from "@namada/integrations";
import { Account, Chain, ExtensionKey, Extensions, TokenType, Tokens } from "@namada/types";
import { TopLevelRoute } from "App/types";
import { AccountsState, addAccounts, fetchBalances } from "slices/accounts";
import { setIsConnected } from "slices/settings";
import { useAppDispatch, useAppSelector } from "store";
import {
  AccountOverviewContainer,
  AccountOverviewContent,
  HeadingContainer,
  NoAccountsContainer,
  TotalAmount,
  TotalAmountFiat,
  TotalAmountValue,
  TotalContainer,
  TotalHeading,
} from "./AccountOverview.components";
import { DerivedAccounts } from "./DerivedAccounts";

import { useAtomValue, useSetAtom } from "jotai";
import { accountsAtom, balancesAtom } from "slices/accounts";
import BigNumber from "bignumber.js";

//TODO: move to utils when we have one
const isEmptyObject = (object: Record<string, unknown>): boolean => {
  return object ? Object.keys(object).length === 0 : true;
};

export const AccountOverview = (): JSX.Element => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const chain = useAppSelector<Chain>((state) => state.chain.config);
  const [isExtensionConnected, setIsExtensionConnected] = useState<
    Record<ExtensionKey, boolean>
  >({
    namada: false,
    keplr: false,
    metamask: false,
  });

  const refreshAccounts = useSetAtom(accountsAtom);
  const refreshBalances = useSetAtom(balancesAtom);

  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);

  const [integration, isConnectingToExtension, withConnection] =
    useIntegrationConnection(chains.namada.id);
  const extensionAlias = Extensions[chain.extension.id].alias;

  const extensionAttachStatus = useUntilIntegrationAttached(chain);
  const currentExtensionAttachStatus =
    extensionAttachStatus[chain.extension.id];

  const handleDownloadExtension = (url: string): void => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const balances = useAtomValue(balancesAtom);
  const totalNativeBalance = Object.values(balances).reduce((acc, balance) => {
    return acc.plus(balance[chain.currency.symbol as TokenType] || BigNumber(0));
  }, BigNumber(0));

  const handleConnectExtension = async (): Promise<void> => {
    withConnection(
      async () => {
        // jotai
        refreshAccounts();
        refreshBalances();

        const accounts = await integration?.accounts();
        if (accounts) {
          dispatch(addAccounts(accounts as Account[]));
          dispatch(fetchBalances());
          dispatch(setIsConnected(chain.id));
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
            <TotalHeading>
              <Heading level="h2">Wallet</Heading>
            </TotalHeading>
          </div>
          <TotalContainer>
            {!isEmptyObject(derived[chain.id]) && (
              <TotalAmount>
                <TotalAmountFiat>{Tokens[chain.currency.symbol as TokenType].symbol}</TotalAmountFiat>
                <TotalAmountValue>{totalNativeBalance.toString()}</TotalAmountValue>
              </TotalAmount>
            )}
          </TotalContainer>
        </HeadingContainer>

        {!isEmptyObject(derived[chain.id]) ? (
          <Stack direction="horizontal" gap={8}>
            <ActionButton onClick={() => navigate(TopLevelRoute.TokenSend)}>
              Send
            </ActionButton>
            <ActionButton onClick={() => navigate(TopLevelRoute.TokenReceive)}>
              Receive
            </ActionButton>
          </Stack>
        ) : (
          <div />
        )}
        {isEmptyObject(derived[chain.id]) && (
          <NoAccountsContainer>
            {!isExtensionConnected[chain.extension.id] && (
              <ActionButton
                onClick={
                  currentExtensionAttachStatus === "attached"
                    ? handleConnectExtension
                    : handleDownloadExtension.bind(null, chain.extension.url)
                }
                style={
                  currentExtensionAttachStatus === "pending" ||
                  isConnectingToExtension
                    ? { color: "transparent" }
                    : {}
                }
              >
                {currentExtensionAttachStatus === "attached" ||
                currentExtensionAttachStatus === "pending"
                  ? `Connect to ${extensionAlias} Extension`
                  : "Click to download the extension"}
              </ActionButton>
            )}
          </NoAccountsContainer>
        )}
        <DerivedAccounts />
      </AccountOverviewContent>
    </AccountOverviewContainer>
  );
};
