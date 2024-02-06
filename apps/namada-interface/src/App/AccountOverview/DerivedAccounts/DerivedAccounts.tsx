import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "styled-components";

import { chains } from "@namada/chains";
import { TokenType, Tokens } from "@namada/types";
import { formatCurrency } from "@namada/utils";

import {
  DerivedAccountAlias,
  DerivedAccountBalance,
  DerivedAccountContainer,
  DerivedAccountInfo,
  DerivedAccountItem,
  DerivedAccountType,
  DerivedAccountsContainer,
  DerivedAccountsList,
  NoTokens,
  ShieldedLabel,
  TokenBalance,
  TokenBalances,
  TokenIcon,
  TokenTotals,
  TransparentLabel,
} from "./DerivedAccounts.components";

// Import PNG images assets
import AssetBitcoin from "./assets/asset-bitcoin-btc.png";
import AssetEthereumEther from "./assets/asset-ethereum-ether.png";
import AssetNamadaNamDark from "./assets/asset-namada-nam-dark.png";
import AssetNamadaNamLight from "./assets/asset-namada-nam-light.png";
import AssetPolkadot from "./assets/asset-polkadot-dot.png";

import { Balance } from "slices/accounts";
import { balanceToFiatAtom, coinsAtom } from "slices/coins";
import { SettingsState } from "slices/settings";
import { useAppSelector } from "store";

import { useAtomValue, useSetAtom } from "jotai";
import { loadable } from "jotai/utils";
import { accountsAtom, balancesAtom } from "slices/accounts";

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
    dark: AssetPolkadot,
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

const FiatBalanceDisplay: React.FC<{
  balance?: Balance;
}> = ({ balance }) => {
  const { fiatCurrency } = useAppSelector<SettingsState>(
    (state) => state.settings
  );

  const balanceToFiat = useAtomValue(loadable(balanceToFiatAtom));

  const displayString =
    typeof balance !== "undefined" && balanceToFiat.state === "hasData"
      ? formatCurrency(fiatCurrency, balanceToFiat.data(balance, fiatCurrency))
      : `${fiatCurrency} -`;

  return <DerivedAccountBalance>{displayString}</DerivedAccountBalance>;
};

const DerivedAccounts = (): JSX.Element => {
  const accountsLoadable = useAtomValue(loadable(accountsAtom));
  const accounts =
    accountsLoadable.state === "hasData" ? accountsLoadable.data : [];

  const balances = useAtomValue(balancesAtom);

  const themeContext = useContext(ThemeContext);
  const [activeAccountAddress, setActiveAccountAddress] = useState("");

  const fetchConversionRates = useSetAtom(coinsAtom);

  const chain = chains.namada;
  const { alias } = chain || {};

  const { colorMode } = themeContext.themeConfigurations;

  const getAssetIconByTheme = (symbol: TokenType): string => {
    return colorMode === "dark"
      ? assetIconByToken[symbol].dark
      : assetIconByToken[symbol].light;
  };

  const handleAccountClick = (address: string): void => {
    setActiveAccountAddress(address === activeAccountAddress ? "" : address);
  };

  useEffect(() => {
    setActiveAccountAddress(accounts[0]?.address);
  }, [accounts]);

  useEffect(() => {
    fetchConversionRates();
  }, []);

  return (
    <DerivedAccountsContainer>
      {accounts.length === 0 && (
        <NoTokens>
          <p>You have no token balances to display on {alias}!</p>
        </NoTokens>
      )}
      <DerivedAccountsList>
        {[...accounts] // cloning because can't call sort on readonly array
          .sort(({ isShielded }) => (isShielded ? -1 : 1))
          .map((account) => {
            const { alias, address, isShielded } = account;
            const balance = balances[address];

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
                  <FiatBalanceDisplay balance={balance} />
                </DerivedAccountContainer>
                {balance && (
                  <TokenTotals
                    className={
                      (address === activeAccountAddress && "active") || ""
                    }
                  >
                    <TokenBalances>
                      {Object.entries(balance)
                        .sort(([tokenType]) => {
                          // Show native token first
                          return tokenType === chain.currency.token ? 1 : -1;
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
                )}
              </DerivedAccountItem>
            );
          })}
      </DerivedAccountsList>
    </DerivedAccountsContainer>
  );
};

export default DerivedAccounts;
