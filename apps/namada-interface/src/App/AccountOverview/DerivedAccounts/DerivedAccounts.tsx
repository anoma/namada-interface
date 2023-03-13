import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "styled-components";
import { useNavigate } from "react-router-dom";

import { chains } from "@anoma/chains";
import { useAppDispatch, useAppSelector } from "store";
import { AccountsState } from "slices/accounts";
import { SettingsState } from "slices/settings";
import { TokenType } from "@anoma/types";
import { formatCurrency, formatRoute } from "@anoma/utils";

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
import AssetCosmosAtom from "./assets/asset-cosmos-atom.png";
import AssetEthereumEther from "./assets/asset-ethereum-ether.png";
import AssetPolkadotDot from "./assets/asset-polkadot-dot.png";
import AssetBitcoinBtc from "./assets/asset-bitcoin-btc.png";

import { TopLevelRoute } from "App/types";
import { CoinsState, fetchConversionRates } from "slices/coins";
import Config from "config";

type Props = {
  setTotal: (total: number) => void;
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
  ["ATOM"]: {
    light: AssetCosmosAtom,
    dark: AssetCosmosAtom,
  },
  ["DOT"]: {
    light: AssetPolkadotDot,
    dark: AssetPolkadotDot,
  },
  ["BTC"]: {
    light: AssetBitcoinBtc,
    dark: AssetBitcoinBtc,
  },
  ["OSMO"]: {
    light: AssetCosmosAtom,
    dark: AssetCosmosAtom,
  },
};

const DerivedAccounts = ({ setTotal }: Props): JSX.Element => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const themeContext = useContext(ThemeContext);
  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);
  const [activeAccountAddress, setActiveAccountAddress] = useState("");

  const { chainId, fiatCurrency } = useAppSelector<SettingsState>(
    (state) => state.settings
  );
  const { rates, timestamp } = useAppSelector<CoinsState>(
    (state) => state.coins
  );
  const { api } = Config;

  const { alias } = chains[chainId] || {};

  const accounts = Object.values(derived[chainId]);
  const { colorMode } = themeContext.themeConfigurations;

  const getAssetIconByTheme = (symbol: TokenType): string => {
    return colorMode === "dark"
      ? assetIconByToken[symbol].dark
      : assetIconByToken[symbol].light;
  };

  const handleAccountClick = (address: string): void => {
    setActiveAccountAddress(address === activeAccountAddress ? "" : address);
  };

  const applyConversionRate = (balance: number, token: string): number => {
    if (rates[token] && rates[token][fiatCurrency]) {
      return balance * rates[token][fiatCurrency].rate;
    }
    return balance;
  };

  useEffect(() => {
    const total = accounts.reduce((acc, entry) => {
      const { balance } = entry;

      let fiatBalance = 0;

      Object.entries(balance).forEach(([token, value]) => {
        fiatBalance += applyConversionRate(value, token);
      });

      return acc + fiatBalance;
    }, 0);
    setTotal(total);
    setActiveAccountAddress(accounts[0]?.details.address);
  }, [derived[chainId], chainId]);

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
                    {formatCurrency(fiatCurrency, 0)}
                  </DerivedAccountBalance>
                </DerivedAccountContainer>
                <TokenTotals
                  className={
                    (address === activeAccountAddress && "active") || ""
                  }
                >
                  <TokenBalances>
                    {Object.entries(balance).map(([token, amount]) => {
                      return (
                        <TokenBalance key={`${address}-${token}`}>
                          <TokenIcon
                            src={getAssetIconByTheme(token as TokenType)}
                            onClick={() => {
                              navigate(
                                formatRoute(TopLevelRoute.TokenTransfers, {
                                  id: address,
                                  token,
                                })
                              );
                            }}
                          />
                          {amount} {token}
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
