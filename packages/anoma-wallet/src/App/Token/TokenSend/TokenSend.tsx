import { useEffect, useState } from "react";

import { AccountsState } from "slices/accounts";
import { SettingsState } from "slices/settings";
import { TransferType } from "slices/transfers";
import { useAppSelector } from "store";

import {
  PAYMENT_ADDRESS_LENGTH,
  PAYMENT_ADDRESS_PREFIX,
  ESTABLISHED_ADDRESS_LENGTH,
  ESTABLISHED_ADDRESS_PREFIX,
} from "./types";
import { Symbols, Tokens, TokenType } from "constants/";

import TokenSendForm from "./TokenSendForm";
import { Heading, HeadingLevel } from "components/Heading";
import { NavigationContainer } from "components/NavigationContainer";
import { Select, Option } from "components/Select";
import {
  TokenSendContainer,
  TokenSendTab,
  TokenSendTabsGroup,
  TokenSendContent,
} from "./TokenSend.components";
import { BalancesState } from "slices/balances";

export const parseTarget = (target: string): TransferType | undefined => {
  if (
    target.startsWith(PAYMENT_ADDRESS_PREFIX) &&
    target.length === PAYMENT_ADDRESS_LENGTH
  ) {
    return TransferType.Shielded;
  } else if (
    target.startsWith(ESTABLISHED_ADDRESS_PREFIX) &&
    target.length === ESTABLISHED_ADDRESS_LENGTH
  ) {
    return TransferType.NonShielded;
  }

  // likely we can unify the form errors and return an object describing the error here
  return undefined;
};

const TokenSend = (): JSX.Element => {
  const { derived, shieldedAccounts: allShieldedAccounts } =
    useAppSelector<AccountsState>((state) => state.accounts);
  const { chainId } = useAppSelector<SettingsState>((state) => state.settings);
  const balancesByChain = useAppSelector<BalancesState>(
    (state) => state.balances
  );
  const balances = balancesByChain[chainId] || {};
  const accounts = derived[chainId] || {};
  const account = Object.values(accounts)[0] || {};
  const [selectedAccountId, setSelectedAccountId] = useState<
    string | undefined
  >(account.id);

  const [selectedShieldedAccountId, setSelectedShieldedAccountId] = useState<
    string | undefined
  >();

  const shieldedAccounts = allShieldedAccounts[chainId] || {};

  // TODO: Refactor and improve this:
  type AccountTokenData = {
    id: string;
    alias: string;
    balance: number;
    tokenType: TokenType;
  };

  const tokenBalances = Object.values(accounts).reduce(
    (data: AccountTokenData[], account) => {
      const { id, alias } = account;

      const accountsWithId: AccountTokenData[] = Symbols.map((symbol) => {
        const balance = (balances[id] || {})[symbol] || 0;

        return {
          id,
          alias,
          tokenType: symbol,
          balance,
        };
      });

      return [...data, ...accountsWithId];
    },
    []
  );

  const tokenData: Option<string>[] = tokenBalances
    .filter((account) => account.balance > 0)
    .map((account) => {
      const { id, alias, tokenType, balance } = account;
      const token = Tokens[tokenType];
      const { coin } = token;

      return {
        value: `${id}|${tokenType}`,
        label: `${
          alias !== "Namada" ? alias + " - " : ""
        }${coin} (${balance} ${tokenType})`,
      };
    });

  const accountsData = Object.values(accounts).map((account) => ({
    value: account.id,
    label: `${account.alias} (${account.tokenType})`,
  }));

  const shieldedAccountsData = Object.values(shieldedAccounts).map(
    (shieldedAccount) => ({
      value: shieldedAccount.id,
      label: `${shieldedAccount.alias} (${shieldedAccount.tokenType})`,
    })
  );

  const tabs = ["Shielded", "Transparent"];
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const { tokenType } = accounts[selectedAccountId || ""] || {};
  const [token, setToken] = useState<TokenType>(tokenType);

  useEffect(() => {
    if (!selectedAccountId && accountsData.length > 0) {
      setSelectedAccountId(accountsData[0].value);
    }
  }, [accountsData, selectedAccountId]);

  useEffect(() => {
    if (!selectedShieldedAccountId && shieldedAccountsData.length > 0) {
      setSelectedShieldedAccountId(shieldedAccountsData[0].value);
    }
  }, [shieldedAccountsData, selectedShieldedAccountId]);

  const handleTransparentTokenChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const { value } = e.target;

    const [accountId, tokenSymbol] = value.split("|");

    setSelectedAccountId(accountId);
    setToken(tokenSymbol as TokenType);
  };

  return (
    <TokenSendContainer>
      <NavigationContainer>
        <Heading level={HeadingLevel.One}>Send</Heading>
      </NavigationContainer>

      <TokenSendTabsGroup>
        {tabs.map((tab) => (
          <TokenSendTab
            className={tab === activeTab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
            key={tab}
          >
            {tab}
          </TokenSendTab>
        ))}
      </TokenSendTabsGroup>

      {activeTab === "Shielded" && (
        <TokenSendContent>
          {shieldedAccountsData.length > 0 && (
            <>
              <Select
                data={shieldedAccountsData || []}
                value={selectedShieldedAccountId}
                label="Token:"
                onChange={(e) => setSelectedShieldedAccountId(e.target.value)}
              />
              {selectedShieldedAccountId && (
                <TokenSendForm
                  accountId={selectedShieldedAccountId}
                  tokenType={token}
                />
              )}
            </>
          )}
        </TokenSendContent>
      )}

      {activeTab === "Transparent" && (
        <TokenSendContent>
          {accountsData.length > 0 && (
            <>
              <Select
                data={tokenData || []}
                value={`${selectedAccountId}|${token}`}
                label="Token:"
                onChange={handleTransparentTokenChange}
              />
              {selectedAccountId && (
                <TokenSendForm
                  accountId={selectedAccountId}
                  tokenType={"NAM"}
                />
              )}
            </>
          )}
        </TokenSendContent>
      )}
    </TokenSendContainer>
  );
};

export default TokenSend;
