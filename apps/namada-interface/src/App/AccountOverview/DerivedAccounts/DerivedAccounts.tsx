import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "styled-components";
import BigNumber from "bignumber.js";

import { chains } from "@namada/chains";
import { TokenType, Tokens } from "@namada/types";
import { formatCurrency } from "@namada/utils";

import {
  DerivedAccountsContainer,
  DerivedAccountsList,
  DerivedAccountItem,
  DerivedAccountBalance,
  DerivedAccountType,
  DerivedAccountInfo,
  DerivedAccountAlias,
  DerivedAccountContainer,
  TokenIcon,
  TokenBalance,
  TransparentLabel,
  ShieldedLabel,
  NoTokens,
  TokenTotals,
  TokenBalances,
} from "./DerivedAccounts.components";

// Import PNG images assets
import AssetNamadaNamLight from "./assets/asset-namada-nam-light.png";
import AssetNamadaNamDark from "./assets/asset-namada-nam-dark.png";
import AssetEthereumEther from "./assets/asset-ethereum-ether.png";
import AssetBitcoin from "./assets/asset-bitcoin-btc.png";
import AssetPolkadot from "./assets/asset-polkadot-dot.png";

import { useAppDispatch, useAppSelector } from "store";
import { AccountsState, Balance } from "slices/accounts";
import { CoinsState, fetchConversionRates } from "slices/coins";
import { SettingsState } from "slices/settings";
import Config from "config";

type Props = {
  setTotal: (total: BigNumber) => void;
};

const assetIconByToken: Record<TokenType, { light: string; dark: string }> = {
  ["NAM"]: {
    light: AssetNamadaNamLight,
    dark: AssetNamadaNamDark,
  },
  ["ETH"]: {
    light: AssetEthereumEther,
    dark: AssetEthereumEther,
  },
  ["BTC"]: {
    light: AssetBitcoin,
    dark: AssetBitcoin,
  },
  ["DOT"]: {
    light: AssetPolkadot,
    dark: AssetPolkadot
  },
  ["SCH"]: {
    light: AssetNamadaNamLight,
    dark: AssetNamadaNamDark,
  },
  ["APF"]: {
    light: AssetNamadaNamLight,
    dark: AssetNamadaNamDark,
  },
  ["KAR"]: {
    light: AssetNamadaNamLight,
    dark: AssetNamadaNamDark,
  },
};

const DerivedAccounts = ({ setTotal }: Props): JSX.Element => {
  const dispatch = useAppDispatch();
  const themeContext = useContext(ThemeContext);
  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);
  const [activeAccountAddress, setActiveAccountAddress] = useState("");

  const { fiatCurrency } = useAppSelector<SettingsState>(
    (state) => state.settings
  );
  const { rates, timestamp } = useAppSelector<CoinsState>(
    (state) => state.coins
  );
  const { api } = Config;
  const chain = chains.namada;
  const { alias } = chain || {};

  const accounts = derived[chain.id] ? Object.values(derived[chain.id]) : [];
  const { colorMode } = themeContext.themeConfigurations;

  const getAssetIconByTheme = (symbol: TokenType): string => {
    return colorMode === "dark"
      ? assetIconByToken[symbol].dark
      : assetIconByToken[symbol].light;
  };

  const handleAccountClick = (address: string): void => {
    setActiveAccountAddress(address === activeAccountAddress ? "" : address);
  };

  const balanceToFiat = (balance: Balance): BigNumber => {
    return Object.entries(balance).reduce((acc, [token, value]) => {

      return acc.plus(
        rates[token] && rates[token][fiatCurrency]
          ? value.multipliedBy(rates[token][fiatCurrency].rate)
          : value
      );
    }, new BigNumber(0));
  };

  useEffect(() => {
    const total = accounts.reduce((acc, { balance }) => {
      return acc.plus(balanceToFiat(balance));
    }, new BigNumber(0));
    setTotal(total);
    setActiveAccountAddress(accounts[0]?.details.address);
  }, [derived[chain.id]]);

  useEffect(() => {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const timeSinceUpdate = currentTimestamp - (timestamp || 0);

    if (!timestamp || timeSinceUpdate > api.cacheTTL) {
      dispatch(fetchConversionRates());
    }
  }, [timestamp]);

  return (
    <DerivedAccountsContainer>
      {accounts.length === 0 && (
        <NoTokens>
          <p>You have no token balances to display on {alias}!</p>
        </NoTokens>
      )}
      <DerivedAccountsList>
        {accounts
          .sort(({ details }) => (details.isShielded ? -1 : 1))
          .map(({ details, balance }) => {
            const { alias, address, isShielded } = details;

            return (
              <DerivedAccountItem key={address}>
                <DerivedAccountContainer
                  onClick={() => handleAccountClick(address)}
                >
                  <DerivedAccountInfo>
                    <DerivedAccountAlias>{alias}</DerivedAccountAlias>
                    <DerivedAccountType>
                      {isShielded ? (
                        <ShieldedLabel>Shielded</ShieldedLabel>
                      ) : (
                        <TransparentLabel>Transparent</TransparentLabel>
                      )}
                    </DerivedAccountType>
                  </DerivedAccountInfo>
                  <DerivedAccountBalance>
                    {formatCurrency(fiatCurrency, balanceToFiat(balance))}
                  </DerivedAccountBalance>
                </DerivedAccountContainer>
                <TokenTotals
                  className={
                    (address === activeAccountAddress && "active") || ""
                  }
                >
                  <TokenBalances>
                    {Object.entries(balance)
                      .sort(([tokenType]) => {
                        // Show native token first
                        return tokenType === chain.currency.token
                          ? 1
                          : -1;
                      })
                      .filter(([_, amount]) => amount.isGreaterThan(0))
                      .map(([token, amount]) => {
                        return (
                          <TokenBalance key={`${address}-${token}`}>
                            <TokenIcon
                              src={getAssetIconByTheme(token as TokenType)}
                            />
                            {amount.toString()}{" "}
                            {Tokens[token as TokenType].symbol}
                          </TokenBalance>
                        );
                      })}
                  </TokenBalances>
                </TokenTotals>
              </DerivedAccountItem>
            );
          })}
      </DerivedAccountsList>
    </DerivedAccountsContainer>
  );
};

export default DerivedAccounts;
