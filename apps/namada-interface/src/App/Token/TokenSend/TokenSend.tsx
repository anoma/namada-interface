import { useEffect, useState } from "react";

import { AccountsState } from "slices/accounts";
import { setChainId, SettingsState } from "slices/settings";
import { TransferType } from "slices/transfers";
import { useAppDispatch, useAppSelector } from "store";

import {
  PAYMENT_ADDRESS_LENGTH,
  PAYMENT_ADDRESS_PREFIX,
  ESTABLISHED_ADDRESS_LENGTH,
  ESTABLISHED_ADDRESS_PREFIX,
} from "./types";
import { Symbols, Tokens, TokenType } from "@anoma/tx";

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
import { useParams } from "react-router-dom";
import Config from "config";

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

type Params = {
  accountIndex: string;
  target: string;
};

const TokenSend = (): JSX.Element => {
  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);
  const { chainId } = useAppSelector<SettingsState>((state) => state.settings);
  const { accountIndex, target } = useParams<Params>();
  const dispatch = useAppDispatch();

  const balancesByChain = useAppSelector<BalancesState>(
    (state) => state.balances
  );
  const balances = balancesByChain[chainId] || {};
  const accounts = derived[chainId] || {};
  const account = Object.values(accounts)[0] || {};
  const [selectedAccountAddress, setSelectedAccountId] = useState<
    string | undefined
  >(account.address);

  const [selectedShieldedAccountAddress, setSelectedShieldedAccountId] =
    useState<string | undefined>();

  // TODO: Refactor and improve this:
  type AccountTokenData = {
    address: string;
    alias?: string;
    balance: number;
    tokenType: TokenType;
  };

  const tokenBalances = Object.values(accounts).reduce(
    (data: AccountTokenData[], account) => {
      const { address, alias } = account;

      const accountsWithId: AccountTokenData[] = Symbols.map((symbol) => {
        const balance = (balances[address] || {})[symbol] || 0;

        return {
          address,
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
      const { alias, address, tokenType, balance } = account;
      const token = Tokens[tokenType];
      const { coin } = token;

      return {
        value: `${address}|${tokenType}`,
        label: `${
          alias !== "Namada"
            ? alias + " (" + balance + " " + tokenType + ")"
            : coin + " (" + balance + " " + tokenType + ")"
        }`,
      };
    });

  const accountsData = Object.values(accounts)
    .filter((account) => !account.isShielded)
    .map((account) => ({
      value: account.address,
      label: `${account.alias}`,
    }));

  const shieldedAccountsData = Object.values(accounts)
    .filter((account) => account.isShielded)
    .map((shieldedAccount) => ({
      value: shieldedAccount.address,
      label: `${shieldedAccount.alias})`,
    }));

  const tabs = ["Shielded", "Transparent"];
  let defaultTab = 0;

  if (target && target.startsWith("atest")) {
    defaultTab = 1;
  }

  const [activeTab, setActiveTab] = useState(tabs[defaultTab]);
  const tokenType = "NAM";
  const [token, setToken] = useState<TokenType>(tokenType);

  useEffect(() => {
    if (accountIndex) {
      const chains = Object.values(Config.chain);
      const targetChain = chains.find(
        (chain) => chain.accountIndex === parseInt(accountIndex)
      );
      // Token Send should match the target's network, otherwise
      // transactions will not succeed:
      if (targetChain && targetChain.id !== chainId) {
        dispatch(setChainId(targetChain.id));
      }
    }
  }, [accountIndex]);

  useEffect(() => {
    if (!selectedAccountAddress && accountsData.length > 0) {
      setSelectedAccountId(accountsData[0].value);
    }
  }, [accountsData, selectedAccountAddress]);

  useEffect(() => {
    if (!selectedShieldedAccountAddress && shieldedAccountsData.length > 0) {
      setSelectedShieldedAccountId(shieldedAccountsData[0].value);
    }
  }, [shieldedAccountsData, selectedShieldedAccountAddress]);

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
                value={selectedShieldedAccountAddress}
                label="Token"
                onChange={(e) => setSelectedShieldedAccountId(e.target.value)}
              />
              {selectedShieldedAccountAddress && (
                <TokenSendForm
                  address={selectedShieldedAccountAddress}
                  tokenType={token}
                  defaultTarget={
                    target?.startsWith("patest") ? target : undefined
                  }
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
                value={`${selectedAccountAddress}|${token}`}
                label="Token"
                onChange={handleTransparentTokenChange}
              />
              {selectedAccountAddress && (
                <TokenSendForm
                  address={selectedAccountAddress}
                  tokenType={token}
                  defaultTarget={
                    target?.startsWith("atest") ? target : undefined
                  }
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
