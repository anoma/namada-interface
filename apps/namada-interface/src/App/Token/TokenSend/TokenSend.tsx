import { useContext, useEffect, useState } from "react";

import { Account, AccountsState } from "slices/accounts";
import { TransferType } from "App/Token/types";
import { useAppSelector } from "store";

import { TokenType, Tokens } from "@namada/types";
import {
  Heading,
  NavigationContainer,
  Select,
  Option,
  TabsGroup,
  Tab,
} from "@namada/components";
import TokenSendForm from "./TokenSendForm";
import { useSanitizedParams } from "@namada/hooks";
import { chains, defaultChainId as chainId } from "@namada/chains";

import { TokenSendContainer, TokenSendContent } from "./TokenSend.components";
import {
  PAYMENT_ADDRESS_LENGTH,
  PAYMENT_ADDRESS_PREFIX,
  ESTABLISHED_ADDRESS_LENGTH,
  ESTABLISHED_ADDRESS_PREFIX,
} from "./types";
import { ChainContext } from "App/App";

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
    return TransferType.Transparent;
  }

  // likely we can unify the form errors and return an object describing the error here
  return undefined;
};

type Params = {
  target: string;
};

const accountsWithBalanceIntoSelectData = (
  accountsWithBalance: Account[]
): Option<string>[] =>
  accountsWithBalance.flatMap(({ details, balance }) =>
    Object.entries(balance)
      .filter(([tokenType, balance]) =>
        !Tokens[tokenType as TokenType].isNut
        && balance.isGreaterThan(0))
      .map(([tokenType, amount]) => ({
        value: `${details.address}|${tokenType}`,
        label: `${details.alias} ${amount} (${tokenType})`,
      }))
  );

const TokenSend = (): JSX.Element => {
  const chain = useContext(ChainContext);
  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);
  const { target } = useSanitizedParams<Params>();

  const accounts = Object.values(derived[chainId]);

  const shieldedAccountsWithBalance = accounts.filter(
    ({ details }) => details.isShielded
  );
  const transparentAccountsWithBalance = accounts.filter(
    ({ details }) => !details.isShielded
  );

  const shieldedTokenData = accountsWithBalanceIntoSelectData(
    shieldedAccountsWithBalance
  );
  const transparentTokenData = accountsWithBalanceIntoSelectData(
    transparentAccountsWithBalance
  );

  const [
    selectedTransparentAccountAddress,
    setSelectedTransparentAccountAddress,
  ] = useState<string | undefined>();

  const [selectedShieldedAccountAddress, setSelectedShieldedAccountAddress] =
    useState<string | undefined>();

  useEffect(() => {
    setSelectedShieldedAccountAddress(
      shieldedAccountsWithBalance?.[0]?.details.address
    );
    setSelectedTransparentAccountAddress(
      transparentAccountsWithBalance?.[0]?.details.address
    );
  }, [derived[chainId]]);

  const tabs = ["Shielded", "Transparent"];
  let defaultTab = 0;

  // Load the correct form if coming from URL in QR code:
  if (target && target.startsWith("tnam")) {
    defaultTab = 1;
  }

  const [activeTab, setActiveTab] = useState(tabs[defaultTab]);
  const [token, setToken] = useState<TokenType>(
    chains[chainId].currency.symbol as TokenType
  );

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
        <Heading level="h1">Send</Heading>
      </NavigationContainer>

      <TabsGroup>
        {tabs.map((tab) => (
          <Tab
            className={tab === activeTab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
            key={tab}
          >
            {tab}
          </Tab>
        ))}
      </TabsGroup>

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
              {chain && selectedShieldedAccountAddress && (
                <TokenSendForm
                  address={selectedShieldedAccountAddress}
                  chain={chain}
                  tokenType={token}
                  defaultTarget={
                    target?.startsWith("znam") ? target : undefined
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
              {chain && selectedTransparentAccountAddress && (
                <TokenSendForm
                  address={selectedTransparentAccountAddress}
                  chain={chain}
                  tokenType={token}
                  defaultTarget={
                    target?.startsWith("tnam") ? target : undefined
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
