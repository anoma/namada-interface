import BigNumber from "bignumber.js";
import { useEffect, useState } from "react";

import { TransferType } from "App/Token/types";
import { Account, AccountsState } from "slices/accounts";
import { useAppSelector } from "store";

import {
  Heading,
  NavigationContainer,
  Option,
  Select,
  Tab,
  TabsGroup,
} from "@namada/components";
import { useSanitizedParams } from "@namada/hooks";
import { Query } from "@namada/shared";
import { Chain, TokenType, Tokens } from "@namada/types";
import TokenSendForm from "./TokenSendForm";
import { chains } from "@namada/chains";

import { TokenSendContainer, TokenSendContent } from "./TokenSend.components";
import {
  ESTABLISHED_ADDRESS_LENGTH,
  ESTABLISHED_ADDRESS_PREFIX,
  PAYMENT_ADDRESS_LENGTH,
  PAYMENT_ADDRESS_PREFIX,
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
      .filter(
        ([tokenType, balance]) =>
          !Tokens[tokenType as TokenType].isNut && balance.isGreaterThan(0)
      )
      .map(([tokenType, amount]) => ({
        value: `${details.address}|${tokenType}`,
        label: `${details.alias} ${amount} (${Tokens[tokenType as TokenType].symbol})`,
      }))
  );

const TokenSend = (): JSX.Element => {
  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);
  const { rpc, currency: { address: nativeToken } } = useAppSelector<Chain>((state) => state.chain.config);
  const { target } = useSanitizedParams<Params>();

  const accounts = Object.values(derived[chains.namada.id]);

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
  }, [derived[chains.namada.id]]);

  const tabs = ["Shielded", "Transparent"];
  let defaultTab = 0;

  // Load the correct form if coming from URL in QR code:
  if (target && target.startsWith("tnam")) {
    defaultTab = 1;
  }

  const [activeTab, setActiveTab] = useState(tabs[defaultTab]);
  const [token, setToken] = useState<TokenType>(
    chains.namada.currency.symbol as TokenType
  );

  const handleTokenChange =
    (selectAccountFn: (accId: string) => void) =>
      (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const { value } = e.target;
        const [accountId, tokenSymbol] = value.split("|");

        selectAccountFn(accountId);
        setToken(tokenSymbol as TokenType);
      };

  const [minimumGasPrice, setMinimumGasPrice] = useState<BigNumber>();

  useEffect(() => {
    (async () => {
      const query = new Query(rpc);
      const result = (await query.query_gas_costs()) as [string, string][];

      const namCost = result.find(([token]) => token === nativeToken);

      if (!namCost) {
        throw new Error("Error querying minimum gas price");
      }

      setMinimumGasPrice(new BigNumber(namCost[1]));
    })();
  }, []);

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
          {shieldedTokenData.length > 0 && minimumGasPrice ? (
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
                    target?.startsWith("znam") ? target : undefined
                  }
                  minimumGasPrice={minimumGasPrice}
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
          {transparentTokenData.length > 0 && minimumGasPrice ? (
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
                    target?.startsWith("tnam") ? target : undefined
                  }
                  minimumGasPrice={minimumGasPrice}
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
