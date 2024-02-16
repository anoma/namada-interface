import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "styled-components";

import { chains } from "@namada/chains";
import { TokenType, Tokens } from "@namada/types";

import {
  DerivedAccountAlias,
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

import { useAtomValue } from "jotai";
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

const DerivedAccounts = (): JSX.Element => {
  const accountsLoadable = useAtomValue(loadable(accountsAtom));
  const accounts =
    accountsLoadable.state === "hasData" ? accountsLoadable.data : [];

  const balances = useAtomValue(balancesAtom);

  const themeContext = useContext(ThemeContext);
  const [activeAccountAddress, setActiveAccountAddress] = useState("");

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

  const symbol = chain.currency.symbol as TokenType;

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
            const nativeBalance = typeof balance === "undefined" ? "-" : (balance[symbol]?.toString() || "0");

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
                  <div className="flex items-center">
                    <span className="text-white">
                      {Tokens[symbol].symbol} {nativeBalance} 
                    </span>
                  </div>
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
