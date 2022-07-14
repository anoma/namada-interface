import { useContext, useEffect } from "react";

import { useAppDispatch, useAppSelector } from "store";
import { AccountsState } from "slices/accounts";
import { BalancesState, fetchBalances } from "slices/balances";
import { SettingsState } from "slices/settings";
import { updateShieldedBalances } from "slices/accountsNew";
import { Symbols, Tokens, TokenType } from "constants/";

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
} from "./DerivedAccounts.components";

// Import PNG images assets
import AssetNamadaNamLight from "./assets/asset-namada-nam-light.png";
import AssetNamadaNamDark from "./assets/asset-namada-nam-dark.png";
import AssetCosmosAtom from "./assets/asset-cosmos-atom.png";
import AssetEthereumEther from "./assets/asset-ethereum-ether.png";
import AssetPolkadotDot from "./assets/asset-polkadot-dot.png";
import AssetBitcoinBtc from "./assets/asset-bitcoin-btc.png";

import { ThemeContext } from "styled-components";
import { useNavigate } from "react-router-dom";
import { TopLevelRoute } from "App/types";
import { formatRoute } from "utils/helpers";
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
};

const DerivedAccounts = ({ setTotal }: Props): JSX.Element => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const themeContext = useContext(ThemeContext);
  const { derived, shieldedAccounts: allShieldedAccounts } =
    useAppSelector<AccountsState>((state) => state.accounts);

  const { chainId } = useAppSelector<SettingsState>((state) => state.settings);
  const balancesByChainId = useAppSelector<BalancesState>(
    (state) => state.balances
  );
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
        label: `${alias !== "Namada" ? alias + " - " : ""}${coin}`,
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
      const tmp: TokenBalance[] =
        tokens.filter((tokenBalance) => tokenBalance.token == symbol) || [];

      // Sort grouped tokens, prioritizing Shielded token balances:
      tmp.sort((a: TokenBalance) => (a.isShielded ? 0 : 1));
      tokenBalances.push(...tmp);
      return tokenBalances;
    },
    []
  );

  useEffect(() => {
    if (groupedTokens.length > 0) {
      const total = tokens.reduce((acc, tokenBalance) => {
        const { balance = 0 } = tokenBalance;

        return acc + balance;
      }, 0);
      // TODO: Set a constant or make a function to round this to the nth decimal place:
      setTotal(Math.ceil(total * 10000) / 10000);
    }
  }, [groupedTokens, chainId]);

  return (
    <DerivedAccountsContainer>
      <DerivedAccountsList>
        {groupedTokens.length === 0 && (
          <NoTokens>
            <p>You have no token balances to display on {alias}!</p>
            {!!faucet && (
              <p>Funds are currently being loaded from the faucet...</p>
            )}
          </NoTokens>
        )}
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
                        })
                      );
                    }}
                  />
                  <div>
                    <DerivedAccountAlias>
                      {label}{" "}
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
                  {balance}&nbsp;
                  {token}
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
