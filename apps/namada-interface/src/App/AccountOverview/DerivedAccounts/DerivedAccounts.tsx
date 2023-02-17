import { useContext, useEffect } from "react";
import { ThemeContext } from "styled-components";
import { useNavigate } from "react-router-dom";

import Config from "config";
import { chains } from "@anoma/chains";
import { useAppDispatch, useAppSelector } from "store";
import { AccountsState } from "slices/accounts";
import { BalancesState, fetchBalances } from "slices/balances";
import { SettingsState } from "slices/settings";
/* import { updateShieldedBalances } from "slices/AccountsNew"; */
import { Symbols, TokenType } from "@anoma/types";
import { formatCurrency, formatRoute } from "@anoma/utils";
import { fetchConversionRates, CoinsState } from "slices/coins";

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
};

const DerivedAccounts = ({ setTotal }: Props): JSX.Element => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const themeContext = useContext(ThemeContext);
  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);

  const { chainId, fiatCurrency } = useAppSelector<SettingsState>(
    (state) => state.settings
  );
  const balancesByChainId = useAppSelector<BalancesState>(
    (state) => state.balances
  );
  const { rates, timestamp } = useAppSelector<CoinsState>(
    (state) => state.coins
  );

  const { api } = Config;
  const { alias, currency } = chains[chainId] || {};

  const transparentBalances = balancesByChainId[chainId] || {};

  type TokenBalance = {
    address: string;
    token: TokenType;
    label: string;
    balance: number;
    isShielded?: boolean;
  };

  const derivedAccounts = derived[chainId] || {};
  const { colorMode } = themeContext.themeConfigurations;

  const accountBalances = Object.values(derivedAccounts).map((account) => {
    const tokens: TokenBalance[] = [];
    const { address, alias, isShielded } = account;

    const balances = transparentBalances[address] || {};
    let tokenSymbols = [];
    if (currency.symbol === "NAM") {
      // TODO: It may be better to add to chain configs an array of all supported tokens,
      // rather than use that logic here only for Namada:
      // Show all supported tokens
      tokenSymbols = Symbols.map((symbol) => symbol);
    } else {
      // Show token for this chain only
      tokenSymbols.push(currency.symbol);
    }

    // TODO: Type this correctly
    // eslint-disable-next-line
    tokenSymbols.forEach((symbol: any) => {
      tokens.push({
        address,
        balance: balances[symbol] || 0,
        label: `${alias}`,
        token: symbol,
        isShielded,
      });
    });

    return {
      account,
      tokens,
    };
  });

  const getAssetIconByTheme = (symbol: TokenType): string => {
    return colorMode === "dark"
      ? assetIconByToken[symbol].dark
      : assetIconByToken[symbol].light;
  };

  // TODO: Check for any shielded accounts, and update balances accordingly
  /* useEffect(() => { */
  /*   if (Object.values(shieldedAccounts).length > 0) { */
  /*     dispatch(updateShieldedBalances()); */
  /*   } */
  /* }, []); */

  useEffect(() => {
    dispatch(fetchBalances(Object.values(derivedAccounts)));
  }, [derivedAccounts]);

  const applyConversionRate = (balance: number, token: string): number => {
    if (rates[token] && rates[token][fiatCurrency]) {
      return balance * rates[token][fiatCurrency].rate;
    }
    return balance;
  };

  useEffect(() => {
    if (accountBalances.length > 0) {
      const total = accountBalances.reduce((acc, accountBalance) => {
        const { tokens } = accountBalance;

        let fiatBalance = 0;

        tokens.forEach((tokenBalance) => {
          const { balance = 0, token } = tokenBalance;

          fiatBalance = applyConversionRate(balance, token);
        });

        return acc + fiatBalance;
      }, 0);
      setTotal(total);
    }
  }, [accountBalances, chainId]);

  useEffect(() => {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const timeSinceUpdate = currentTimestamp - (timestamp || 0);

    if (!timestamp || timeSinceUpdate > api.cacheTTL) {
      dispatch(fetchConversionRates());
    }
  }, [timestamp]);

  return (
    <DerivedAccountsContainer>
      {accountBalances.length === 0 &&
        Object.values(derivedAccounts).length > 0 && (
          <NoTokens>
            <p>You have no token balances to display on {alias}!</p>
          </NoTokens>
        )}

      <DerivedAccountsList>
        {accountBalances.map((accountBalance) => {
          const { account, tokens } = accountBalance;
          const { alias, address, isShielded } = account;

          return (
            <>
              <DerivedAccountItem key={address}>
                <DerivedAccountContainer>
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
              </DerivedAccountItem>
              <TokenTotals>
                <TokenBalances>
                  {tokens.map((tokenBalance) => {
                    const { balance, token } = tokenBalance;

                    return (
                      <TokenBalance key={`${address}-${token}`}>
                        <TokenIcon
                          src={getAssetIconByTheme(token)}
                          onClick={() => {
                            navigate(
                              formatRoute(TopLevelRoute.TokenTransfers, {
                                id: address,
                                token,
                              })
                            );
                          }}
                        />
                        {balance} {token}
                      </TokenBalance>
                    );
                  })}
                </TokenBalances>
              </TokenTotals>
            </>
          );
        })}
      </DerivedAccountsList>
    </DerivedAccountsContainer>
  );
};

export default DerivedAccounts;
