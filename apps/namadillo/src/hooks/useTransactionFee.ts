import { GasEstimate } from "@namada/indexer-client";
import { nativeTokenAddressAtom } from "atoms/chain";
import {
  gasEstimateFamily,
  GasPriceTable,
  gasPriceTableAtom,
  isPublicKeyRevealedAtom,
} from "atoms/fees";
import BigNumber from "bignumber.js";
import { useAtomValue } from "jotai";
import { useState } from "react";
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

export const useTransactionFee = (txKinds: TxKind[]): TransactionFeeProps => {
  const [gasLimitValue, setGasLimitValue] = useState<BigNumber | undefined>();
  const [gasTokenValue, setGasTokenValue] = useState<string | undefined>();
  const isPublicKeyRevealed = useAtomValue(isPublicKeyRevealedAtom);

  const { data: nativeToken, isLoading: isLoadingNativeToken } = useAtomValue(
    nativeTokenAddressAtom
  );

  const { data: gasEstimate, isLoading: isLoadingGasEstimate } = useAtomValue(
    gasEstimateFamily(isPublicKeyRevealed ? txKinds : ["RevealPk", ...txKinds])
  );

  const { data: gasPriceTable, isLoading: isLoadingGasPriceTable } =
    useAtomValue(gasPriceTableAtom);

  const averageGasLimit = gasEstimate && BigNumber(gasEstimate.avg);
  const gasLimit = gasLimitValue ?? averageGasLimit ?? BigNumber(0);
  const gasToken = gasTokenValue ?? nativeToken ?? "";
  const gasPrice =
    gasPriceTable?.find((i) => i.token === gasToken)?.gasPrice ?? BigNumber(0);

  const gasConfig: GasConfig = {
    gasLimit,
    gasPrice,
    gasToken,
  };

  const isLoading =
    isLoadingNativeToken || isLoadingGasEstimate || isLoadingGasPriceTable;

  return {
    gasConfig,
    isLoading,
    gasEstimate,
    gasPriceTable,
    onChangeGasLimit: setGasLimitValue,
    onChangeGasToken: setGasTokenValue,
  };
};
