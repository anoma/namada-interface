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
import { Symbols, TokenType } from "@anoma/types";

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
  target: string;
};

const TokenSend = (): JSX.Element => {
  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);
  const { chainId } = useAppSelector<SettingsState>((state) => state.settings);
  const { target } = useParams<Params>();

  const balancesByChain = useAppSelector<BalancesState>(
    (state) => state.balances
  );
  const balances = balancesByChain[chainId] || {};
  const accounts = derived[chainId] || {};

  const transparentAccounts = Object.values(accounts).filter(
    (account) => !account.isShielded
  );
  const shieldedAccounts = Object.values(accounts).filter(
    (account) => account.isShielded
  );

  const account = Object.values(accounts)[0] || {};
  const [
    selectedTransparentAccountAddress,
    setSelectedTransparentAccountAddress,
  ] = useState<string | undefined>(account.address);

  const [selectedShieldedAccountAddress, setSelectedShieldedAccountAddress] =
    useState<string | undefined>();

  type AccountTokenData = {
    address: string;
    alias?: string;
    balance: number;
    tokenType: TokenType;
    isShielded: boolean;
  };

  // Get balances for each token & account
  const tokenBalances = Object.values(accounts).reduce(
    (data: AccountTokenData[], account) => {
      const { address, alias, isShielded } = account;

      const accountsWithToken: AccountTokenData[] = Symbols.map((symbol) => {
        const balance = (balances[address] || {})[symbol] || 0;

        return {
          address,
          alias,
          tokenType: symbol,
          balance,
          isShielded,
        };
      });

      return [...data, ...accountsWithToken];
    },
    []
  );

  // TODO - This should probably be refactored to map token data
  // to accounts in order to set the default token more cleanly, and from
  // that new array/object we can generated the Select dropdown data:
  // Create token data for either Shielded or Transparent accounts
  const getTokenData = (isShielded: boolean): Option<string>[] => {
    return tokenBalances
      .filter(
        (account) => account.balance > 0 && account.isShielded === isShielded
      )
      .map((account) => {
        const { alias, address, tokenType, balance } = account;
        return {
          value: `${address}|${tokenType}`,
          label: `${alias} ${balance} (${tokenType})`,
        };
      });
  };

  const transparentTokenData = getTokenData(false);
  const shieldedTokenData = getTokenData(true);

  const tabs = ["Shielded", "Transparent"];
  let defaultTab = 0;

  // Load the correct form if coming from URL in QR code:
  if (target && target.startsWith("atest")) {
    defaultTab = 1;
  }

  const [activeTab, setActiveTab] = useState(tabs[defaultTab]);
  const defaultTokenType = "NAM";
  // TODO: We should refactor transparentTokenData to provide a mapping to the
  // currently selected account in order to set the initial token type,
  // and to avoid parsing as we do below:
  const [token, setToken] = useState<TokenType>(
    (transparentTokenData[0].value.split("|")[1] as TokenType) ||
      defaultTokenType
  );

  useEffect(() => {
    // Set selectedTransparentAccountAddress to first account if one
    // hasn't been set:
    if (!selectedTransparentAccountAddress && transparentAccounts.length > 0) {
      setSelectedTransparentAccountAddress(transparentAccounts[0].address);
    }
  }, [transparentAccounts, selectedTransparentAccountAddress]);

  useEffect(() => {
    // Set selectedShieldedAccountAddress to first account if one
    // hasn't been set:
    if (!selectedShieldedAccountAddress && shieldedAccounts.length > 0) {
      setSelectedShieldedAccountAddress(shieldedAccounts[0].address);
    }
  }, [shieldedAccounts, selectedShieldedAccountAddress]);

  const handleTokenChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const { value } = e.target;
    const [accountId, tokenSymbol] = value.split("|");

    setSelectedTransparentAccountAddress(accountId);
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
          {shieldedTokenData.length > 0 ? (
            <>
              <Select
                data={shieldedTokenData}
                value={`${selectedShieldedAccountAddress}|${token}`}
                label="Token"
                onChange={handleTokenChange}
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
          ) : (
            <p>You have no shielded token balances.</p>
          )}
        </TokenSendContent>
      )}

      {activeTab === "Transparent" && (
        <TokenSendContent>
          {transparentTokenData.length > 0 ? (
            <>
              <Select
                data={transparentTokenData}
                value={`${selectedTransparentAccountAddress}|${token}`}
                label="Token"
                onChange={handleTokenChange}
              />
              {selectedTransparentAccountAddress && (
                <TokenSendForm
                  address={selectedTransparentAccountAddress}
                  tokenType={token}
                  defaultTarget={
                    target?.startsWith("atest") ? target : undefined
                  }
                />
              )}
            </>
          ) : (
            <p>You have no transparent token balances.</p>
          )}
        </TokenSendContent>
      )}
    </TokenSendContainer>
  );
};

export default TokenSend;
