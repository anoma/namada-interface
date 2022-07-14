import { useContext, useEffect } from "react";

import { useAppDispatch, useAppSelector } from "store";
import { AccountsState, fetchBalanceByAccount } from "slices/accounts";
import { SettingsState } from "slices/settings";
import { updateShieldedBalances } from "slices/accountsNew";
import { TokenType } from "constants/";

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
  const derivedAccounts = derived[chainId] || {};
  const shieldedAccounts = allShieldedAccounts[chainId] || {};
  const { isLightMode } = themeContext.themeConfigurations;

  const getAssetIconByTheme = (symbol: TokenType): string => {
    return isLightMode
      ? assetIconByToken[symbol].light
      : assetIconByToken[symbol].dark;
  };

  useEffect(() => {
    const keys = Object.keys(derivedAccounts);
    if (keys.length > 0) {
      keys.forEach((key) => {
        const account = derivedAccounts[key];
        if (!account.balance) {
          dispatch(fetchBalanceByAccount(account));
        }
      });
    }

    if (Object.values(shieldedAccounts).length > 0) {
      dispatch(updateShieldedBalances());
    }
  }, []);

  const shieldedAndTransparentAccounts = {
    ...derivedAccounts,
    ...shieldedAccounts,
  };

  useEffect(() => {
    if (Object.values(shieldedAndTransparentAccounts).length > 0) {
      const total = Object.values(shieldedAndTransparentAccounts).reduce(
        (acc, account) => {
          const { balance } = account;

          return acc + balance;
        },
        0
      );
      setTotal(total);
    }
  }, [shieldedAndTransparentAccounts]);

  return (
    <DerivedAccountsContainer>
      <DerivedAccountsList>
        {Object.keys(shieldedAndTransparentAccounts)
          .reverse()
          .map((hash: string) => {
            const {
              id,
              alias,
              tokenType,
              balance,
              isInitializing,
              isShielded,
            } = shieldedAndTransparentAccounts[hash];

            return (
              <DerivedAccountItem key={id}>
                <DerivedAccountContainer>
                  <DerivedAccountInfo>
                    <TokenIcon
                      src={getAssetIconByTheme(tokenType)}
                      onClick={() => {
                        navigate(
                          formatRoute(TopLevelRoute.TokenTransfers, { id })
                        );
                      }}
                    />
                    <div>
                      <DerivedAccountAlias>
                        {alias} {isInitializing && <i>(initializing)</i>}
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
                    {tokenType}
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
