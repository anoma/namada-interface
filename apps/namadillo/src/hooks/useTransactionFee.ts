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

    if (new BigNumber(nativeAddressBalance?.minDenomAmount || "0").gt(0)) {
      return nativeAddressBalance?.tokenAddress;
    }

    // Fallback to another token containing balance
    const gas = gasPriceTable.filter((gas) => {
      return !!balances.find(
        (balances) =>
          balances.tokenAddress === gas.token &&
          new BigNumber(balances.minDenomAmount).gt(0)
      );
    });

    // If no token found, fallback to NAM
    return gas.length > 0 ? gas[0].token : nativeToken;
  }, [userTransparentBalances, gasPriceTable, isShielded]);

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
