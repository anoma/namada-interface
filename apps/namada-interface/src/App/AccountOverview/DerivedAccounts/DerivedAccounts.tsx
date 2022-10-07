import { useContext, useEffect } from "react";
import { ThemeContext } from "styled-components";
import { useNavigate } from "react-router-dom";

import Config from "config";
import { useAppDispatch, useAppSelector } from "store";
import { AccountsState } from "slices/accounts";
import { BalancesState, fetchBalances } from "slices/balances";
import { SettingsState } from "slices/settings";
import { updateShieldedBalances } from "slices/AccountsNew";
import { Symbols, Tokens, TokenType } from "@anoma/tx";
import { formatRoute } from "@anoma/utils";
import { TransfersState } from "slices/transfers";
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
  TransparentLabel,
  ShieldedLabel,
  NoTokens,
  DerivedAccountStatus,
  Status,
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
  const { derived, shieldedAccounts: allShieldedAccounts } =
    useAppSelector<AccountsState>((state) => state.accounts);

  const { isTransferSubmitting } = useAppSelector<TransfersState>(
    (state) => state.transfers
  );
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
  const chains = Config.chain;
  const { faucet, alias } = chains[chainId] || {};

  const transparentBalances = balancesByChainId[chainId] || {};

  type TokenBalance = {
    accountId: string;
    token: TokenType;
    label: string;
    balance: number;
    isShielded?: boolean;
    isInitializing?: boolean;
    isInitial?: boolean;
  };

  const derivedAccounts = derived[chainId] || {};
  const shieldedAccounts = allShieldedAccounts[chainId] || {};
  const { isLightMode } = themeContext.themeConfigurations;

  const tokenBalances: TokenBalance[] = [];

  Object.values(derivedAccounts).forEach((account) => {
    const { id, alias, isShielded, isInitializing, isInitial } = account;

    const balances = transparentBalances[id] || {};

    Symbols.forEach((symbol) => {
      const token = Tokens[symbol];
      const { coin } = token;

      tokenBalances.push({
        accountId: account.id,
        balance: balances[symbol || 0],
        label: `${alias !== "Namada" ? alias : coin}`,
        token: symbol,
        isShielded,
        isInitializing,
        isInitial,
      });
    });
  });

  const tokens = tokenBalances.filter(
    (tokenBalance) => tokenBalance.balance > 0 || tokenBalance.isInitial
  );

  const getAssetIconByTheme = (symbol: TokenType): string => {
    return isLightMode
      ? assetIconByToken[symbol].light
      : assetIconByToken[symbol].dark;
  };

  useEffect(() => {
    if (Object.values(shieldedAccounts).length > 0) {
      dispatch(updateShieldedBalances());
    }
  }, []);

  useEffect(() => {
    dispatch(
      fetchBalances({
        chainId,
        accounts: Object.values(derivedAccounts),
      })
    );
  }, [derivedAccounts]);

  Object.values(shieldedAccounts).forEach((shieldedAccount) => {
    const { id, alias, tokenType, isShielded, balance } = shieldedAccount;

    tokens.push({
      accountId: id,
      token: tokenType as TokenType,
      label: alias,
      balance: balance || 0,
      isShielded,
    });
  });

  /**
   * I agree that this is probably not the most efficient way of handling grouping:
   */
  const groupedTokens = Symbols.reduce(
    (tokenBalances: TokenBalance[], symbol) => {
      const shielded: TokenBalance[] =
        tokens.filter(
          (tokenBalance) =>
            tokenBalance.token === symbol && tokenBalance.isShielded
        ) || [];
      const transparent: TokenBalance[] =
        tokens.filter(
          (tokenBalance) =>
            tokenBalance.token === symbol && !tokenBalance.isShielded
        ) || [];
      tokenBalances.push(...shielded, ...transparent);
      return tokenBalances;
    },
    []
  );

  useEffect(() => {
    if (groupedTokens.length > 0) {
      const total = tokens.reduce((acc, tokenBalance) => {
        const { balance = 0, token } = tokenBalance;
        let fiatBalance = 0;

        if (rates[token] && rates[token][fiatCurrency]) {
          fiatBalance = balance * rates[token][fiatCurrency].rate;
        }
        return acc + (fiatBalance || balance);
      }, 0);
      setTotal(total);
    }
  }, [groupedTokens, chainId]);

  useEffect(() => {
    if (groupedTokens.length > 0) {
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const timeSinceUpdate = currentTimestamp - (timestamp || 0);

      if (!timestamp || timeSinceUpdate > api.cacheTTL) {
        dispatch(fetchConversionRates());
      }
    }
  }, [timestamp]);

  return (
    <DerivedAccountsContainer>
      {groupedTokens.length === 0 && (
        <NoTokens>
          <p>You have no token balances to display on {alias}!</p>
        </NoTokens>
      )}
      {isTransferSubmitting && faucet && (
        <Status>Transferring from testnet faucet to your account...</Status>
      )}
      <DerivedAccountsList>
        {groupedTokens.map((tokenBalance) => {
          const {
            accountId,
            token,
            label,
            balance,
            isInitializing,
            isShielded,
          } = tokenBalance;

          return (
            <DerivedAccountItem key={`${accountId}-${token}`}>
              <DerivedAccountContainer>
                <DerivedAccountInfo>
                  <TokenIcon
                    src={getAssetIconByTheme(token)}
                    onClick={() => {
                      navigate(
                        formatRoute(TopLevelRoute.TokenTransfers, {
                          id: accountId,
                          token,
                        })
                      );
                    }}
                  />
                  <div>
                    <DerivedAccountAlias>
                      {label}
                      {isInitializing && (
                        <DerivedAccountStatus>
                          (initializing...)
                        </DerivedAccountStatus>
                      )}
                    </DerivedAccountAlias>
                    <DerivedAccountType>
                      {isShielded ? (
                        <ShieldedLabel>Shielded</ShieldedLabel>
                      ) : (
                        <TransparentLabel>Transparent</TransparentLabel>
                      )}
                    </DerivedAccountType>
                  </div>
                </DerivedAccountInfo>

                <DerivedAccountBalance>
                  {balance} {token}
                </DerivedAccountBalance>
              </DerivedAccountContainer>
            </DerivedAccountItem>
          );
        })}
      </DerivedAccountsList>
    </DerivedAccountsContainer>
  );
};

export default DerivedAccounts;
