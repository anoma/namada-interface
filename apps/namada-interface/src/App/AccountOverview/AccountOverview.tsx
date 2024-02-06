import BigNumber from "bignumber.js";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { chains } from "@namada/chains";
import { ActionButton, Heading, Stack } from "@namada/components";
import {
  useIntegrationConnection,
  useUntilIntegrationAttached,
} from "@namada/integrations";
import { Account, Chain, ExtensionKey, Extensions } from "@namada/types";
import { formatCurrency } from "@namada/utils";
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

import { atom, useAtomValue, useSetAtom } from "jotai";
import { loadable } from "jotai/utils";
import { accountsAtom, balancesAtom } from "slices/accounts";
import { balanceToFiatAtom } from "slices/coins";
import { fiatCurrencyAtom } from "slices/settings";

//TODO: move to utils when we have one
const isEmptyObject = (object: Record<string, unknown>): boolean => {
  return object ? Object.keys(object).length === 0 : true;
};

const totalBalanceAtom = atom(async (get) => {
  const accounts = await get(accountsAtom);
  const balances = get(balancesAtom);
  const balanceToFiat = await get(balanceToFiatAtom);
  const fiatCurrency = get(fiatCurrencyAtom);

  return accounts.reduce((acc, account) => {
    const balance = balances[account.address];

    if (typeof balance === "undefined") {
      return acc;
    } else {
      return acc.plus(balanceToFiat(balance, fiatCurrency));
    }
  }, new BigNumber(0));
});

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

  const fiatCurrency = useAtomValue(fiatCurrencyAtom);

  const [integration, isConnectingToExtension, withConnection] =
    useIntegrationConnection(chains.namada.id);
  const extensionAlias = Extensions[chain.extension.id].alias;

  const extensionAttachStatus = useUntilIntegrationAttached(chain);
  const currentExtensionAttachStatus =
    extensionAttachStatus[chain.extension.id];

  const total = useAtomValue(loadable(totalBalanceAtom));

  const totalDisplayString = formatCurrency(
    fiatCurrency,
    total.state === "hasData" ? total.data : new BigNumber(0)
  );

  const handleDownloadExtension = (url: string): void => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

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
                <TotalAmountFiat>{fiatCurrency}</TotalAmountFiat>
                <TotalAmountValue>{totalDisplayString}</TotalAmountValue>
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
