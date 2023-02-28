import { useState } from "react";
import { useParams } from "react-router-dom";

import { AccountsState, Balance } from "slices/accounts";
import { SettingsState } from "slices/settings";
import { TransferType } from "slices/transfers";
import { useAppSelector } from "store";

import { Account, TokenType } from "@anoma/types";
import {
  Heading,
  HeadingLevel,
  NavigationContainer,
  Select,
  Option,
} from "@anoma/components";
import TokenSendForm from "./TokenSendForm";

import {
  TokenSendContainer,
  TokenSendTab,
  TokenSendTabsGroup,
  TokenSendContent,
} from "./TokenSend.components";
import {
  PAYMENT_ADDRESS_LENGTH,
  PAYMENT_ADDRESS_PREFIX,
  ESTABLISHED_ADDRESS_LENGTH,
  ESTABLISHED_ADDRESS_PREFIX,
} from "./types";

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

const accountsWithBalanceIntoSelectData = (
  accountsWithBalance: { account: Account; balance: Balance }[]
): Option<string>[] =>
  accountsWithBalance.flatMap(({ account, balance }) =>
    Object.entries(balance).map(([tokenType, amount]) => ({
      value: `${account.address}|${tokenType}`,
      label: `${account.alias} ${amount} (${tokenType})`,
    }))
  );

const TokenSend = (): JSX.Element => {
  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);
  const { chainId } = useAppSelector<SettingsState>((state) => state.settings);
  const { target } = useParams<Params>();

  const accountsWithBalance = Object.values(derived[chainId]);

  const shieldedAccountsWithBalance = accountsWithBalance.filter(
    ({ account }) => account.isShielded
  );
  const transparentAccountsWithBalance = accountsWithBalance.filter(
    ({ account }) => !account.isShielded
  );

  const shieldedTokenData = accountsWithBalanceIntoSelectData(
    shieldedAccountsWithBalance
  );
  const transparentTokenData = accountsWithBalanceIntoSelectData(
    transparentAccountsWithBalance
  );

  const { account } = Object.values(accountsWithBalance)[0] || {};
  const [
    selectedTransparentAccountAddress,
    setSelectedTransparentAccountAddress,
  ] = useState<string | undefined>(account.address);

  const [selectedShieldedAccountAddress, setSelectedShieldedAccountAddress] =
    useState<string | undefined>();

  const tabs = ["Shielded", "Transparent"];
  let defaultTab = 0;

  // Load the correct form if coming from URL in QR code:
  if (target && target.startsWith("atest")) {
    defaultTab = 1;
  }

  const [activeTab, setActiveTab] = useState(tabs[defaultTab]);
  const [token, setToken] = useState<TokenType>("NAM");

  const handleTokenChange =
    (selectAccountFn: (accId: string) => void) =>
    (e: React.ChangeEvent<HTMLSelectElement>): void => {
      const { value } = e.target;
      const [accountId, tokenSymbol] = value.split("|");

      selectAccountFn(accountId);
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
                onChange={handleTokenChange(setSelectedShieldedAccountAddress)}
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
                onChange={handleTokenChange(
                  setSelectedTransparentAccountAddress
                )}
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
