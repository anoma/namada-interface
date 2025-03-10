import { GasEstimate } from "@namada/indexer-client";
import { transparentBalanceAtom } from "atoms/accounts";
import { shieldedBalanceAtom } from "atoms/balance";
import { nativeTokenAddressAtom } from "atoms/chain";
import {
  gasEstimateFamily,
  GasPriceTable,
  gasPriceTableAtom,
  isPublicKeyRevealedAtom,
} from "atoms/fees";
import { tokenPricesFamily } from "atoms/prices/atoms";
import BigNumber from "bignumber.js";
import { useAtomValue } from "jotai";
import { useMemo, useState } from "react";
import { GasConfig } from "types";
import { TxKind } from "types/txKind";

export type TransactionFeeProps = {
  gasConfig: GasConfig;
  isLoading: boolean;
  gasEstimate: GasEstimate | undefined;
  gasPriceTable: GasPriceTable | undefined;
  onChangeGasLimit: (value: BigNumber) => void;
  onChangeGasToken: (value: string) => void;
};

export const useTransactionFee = (
  txKinds: TxKind[],
  isShielded = false
): TransactionFeeProps => {
  const [gasLimitValue, setGasLimitValue] = useState<BigNumber | undefined>();
  const [gasTokenValue, setGasTokenValue] = useState<string | undefined>();
  const userTransparentBalances = useAtomValue(transparentBalanceAtom);
  const userShieldedBalances = useAtomValue(shieldedBalanceAtom);
  const isPublicKeyRevealed = useAtomValue(isPublicKeyRevealedAtom);

  const { data: nativeToken, isLoading: isLoadingNativeToken } = useAtomValue(
    nativeTokenAddressAtom
  );

  const { data: gasEstimate, isLoading: isLoadingGasEstimate } = useAtomValue(
    gasEstimateFamily(isPublicKeyRevealed ? txKinds : ["RevealPk", ...txKinds])
  );

  const { data: gasPriceTable, isLoading: isLoadingGasPriceTable } =
    useAtomValue(gasPriceTableAtom);

  const gasDollarMap =
    useAtomValue(
      tokenPricesFamily(gasPriceTable?.map((item) => item.token) ?? [])
    ).data ?? {};

  const findCheapestToken = (
    gasPriceTable: GasPriceTable
  ): string | undefined => {
    let minPriceInDollars: BigNumber | undefined,
      cheapestToken: string | undefined;

    for (const gasItem of gasPriceTable) {
      const price = gasDollarMap[gasItem.token];
      if (!price) return;
      const gasPriceInDollars = price.multipliedBy(gasItem.gasPrice);
      if (
        typeof minPriceInDollars === "undefined" ||
        gasPriceInDollars.lt(minPriceInDollars)
      ) {
        minPriceInDollars = gasPriceInDollars;
        cheapestToken = gasItem.token;
      }
    }

    return cheapestToken;
  };

  const availableGasTokenAddress = useMemo(() => {
    if (!gasPriceTable) return nativeToken;

    if (isShielded && !userShieldedBalances.data) {
      return nativeToken;
    }

    if (!isShielded && !userTransparentBalances.data) {
      return nativeToken;
    }

    // Separate shielded amount from transparent
    const balances =
      (isShielded ?
        // TODO: we need to refactor userShieldedBalances to return Balance[] type instead
        userShieldedBalances.data?.map((balance) => ({
          minDenomAmount: balance.minDenomAmount,
          tokenAddress: balance.address,
        }))
      : userTransparentBalances.data) || [];

    // Check if user has enough NAM to pay fees
    const nativeAddressBalance = balances.find(
      (balance) => balance.tokenAddress === nativeToken
    );

    if (BigNumber(nativeAddressBalance?.minDenomAmount || "0").gt(0)) {
      return nativeAddressBalance?.tokenAddress;
    }

    // Fallback to another token containing balance
    const gas = gasPriceTable.filter((gas) => {
      return !!balances.find(
        (balances) =>
          balances.tokenAddress === gas.token &&
          BigNumber(balances.minDenomAmount).gt(0)
      );
    });

    // All users balances are empty, so we return native token
    if (gas.length === 0) {
      return nativeToken;
    }

    // Search for the cheapest token for fees (in dollars) among the available tokens:
    return findCheapestToken(gas) || nativeToken;
  }, [
    userTransparentBalances.data,
    userShieldedBalances.data,
    gasPriceTable,
    gasDollarMap,
    isShielded,
  ]);

  const averageGasLimit = gasEstimate && BigNumber(gasEstimate.avg);
  const gasLimit = gasLimitValue ?? averageGasLimit ?? BigNumber(0);
  const gasToken = gasTokenValue ?? availableGasTokenAddress ?? "";
  const gasPrice =
    gasPriceTable?.find((i) => i.token === gasToken)?.gasPrice ?? BigNumber(0);

  const gasConfig: GasConfig = {
    gasLimit,
    gasPriceInMinDenom: gasPrice,
    gasToken,
  };

  const isLoading =
    userTransparentBalances.isLoading ||
    isLoadingNativeToken ||
    isLoadingGasEstimate ||
    isLoadingGasPriceTable;

  return {
    gasConfig,
    isLoading,
    gasEstimate,
    gasPriceTable,
    onChangeGasLimit: setGasLimitValue,
    onChangeGasToken: setGasTokenValue,
  };
};
