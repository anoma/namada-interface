import { Chain } from "@chain-registry/types";
import { Panel } from "@namada/components";
import { AccountType } from "@namada/types";
import { NamadaTransferTopHeader } from "App/NamadaTransfer/NamadaTransferTopHeader";
import { params } from "App/routes";
import {
  OnSubmitTransferParams,
  TransferModule,
} from "App/Transfer/TransferModule";
import { allDefaultAccountsAtom } from "atoms/accounts";
import { namadaTransparentAssetsAtom } from "atoms/balance/atoms";
import { chainParametersAtom } from "atoms/chain/atoms";
import { rpcUrlAtom } from "atoms/settings";
import BigNumber from "bignumber.js";
import { useTransactionActions } from "hooks/useTransactionActions";
import { useTransfer } from "hooks/useTransfer";
import { wallets } from "integrations";
import invariant from "invariant";
import { useAtomValue } from "jotai";
import { createTransferDataFromNamada } from "lib/transactions";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import namadaChain from "registry/namada.json";
import { Address } from "types";

export const MaspShield: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { storeTransaction } = useTransactionActions();
  const [displayAmount, setDisplayAmount] = useState<BigNumber | undefined>();
  const [generalErrorMessage, setGeneralErrorMessage] = useState("");
  const [currentStatus, setCurrentStatus] = useState("");
  const [currentStatusExplanation, setCurrentStatusExplanation] = useState("");

  const rpcUrl = useAtomValue(rpcUrlAtom);
  const chainParameters = useAtomValue(chainParametersAtom);
  const defaultAccounts = useAtomValue(allDefaultAccountsAtom);

  const { data: availableAssets, isLoading: isLoadingAssets } = useAtomValue(
    namadaTransparentAssetsAtom
  );

  const chainId = chainParameters.data?.chainId;
  const sourceAddress = defaultAccounts.data?.find(
    (account) => account.type !== AccountType.ShieldedKeys
  )?.address;
  const destinationAddress = defaultAccounts.data?.find(
    (account) => account.type === AccountType.ShieldedKeys
  )?.address;

  const selectedAssetAddress = searchParams.get(params.asset) || undefined;
  const selectedAsset =
    selectedAssetAddress ? availableAssets?.[selectedAssetAddress] : undefined;

  const {
    execute: performTransfer,
    isPending: isPerformingTransfer,
    isSuccess,
    error,
    txKind,
    feeProps,
  } = useTransfer({
    source: sourceAddress ?? "",
    target: destinationAddress ?? "",
    token: selectedAsset?.originalAddress ?? "",
    displayAmount: displayAmount ?? new BigNumber(0),
    onUpdateStatus: setCurrentStatus,
    onBeforeBuildTx: () => {
      setCurrentStatus("Generating MASP Parameters...");
      setCurrentStatusExplanation(
        "Generating MASP parameters can take a few seconds. Please wait..."
      );
    },
    onBeforeSign: () => {
      setCurrentStatus("Waiting for signature...");
    },
    onBeforeBroadcast: () => {
      setCurrentStatus("Broadcasting Shielding transaction...");
    },
    onError: () => {
      setCurrentStatus("");
      setCurrentStatusExplanation("");
    },
    asset: selectedAsset?.asset,
  });

  const onChangeSelectedAsset = (address?: Address): void => {
    setSearchParams(
      (currentParams) => {
        const newParams = new URLSearchParams(currentParams);
        if (address) {
          newParams.set(params.asset, address);
        } else {
          newParams.delete(params.asset);
        }
        return newParams;
      },
      { replace: true }
    );
  };

  const onSubmitTransfer = async ({
    memo,
  }: OnSubmitTransferParams): Promise<void> => {
    try {
      setGeneralErrorMessage("");
      setCurrentStatus("");

      invariant(sourceAddress, "Source address is not defined");
      invariant(chainId, "Chain ID is undefined");
      invariant(selectedAsset, "No asset is selected");

      const txResponse = await performTransfer({ memo });

      if (txResponse) {
        const txList = createTransferDataFromNamada(
          txKind,
          selectedAsset.asset,
          rpcUrl,
          true,
          txResponse,
          memo
        );

        // Currently we don't have the option of batching transfer transactions
        if (txList.length === 0) {
          throw "Couldn't create TransferData object";
        }
        const tx = txList[0];
        storeTransaction(tx);
      } else {
        throw "Invalid transaction response";
      }
    } catch (err) {
      setGeneralErrorMessage(err + "");
    }
  };

  return (
    <Panel className="relative min-h-[600px] flex-1">
      <header className="flex flex-col items-center text-center mb-3 gap-6">
        <h1 className="mt-6 text-lg text-yellow">Shield</h1>
        <NamadaTransferTopHeader
          isSourceShielded={false}
          isDestinationShielded={true}
        />
        <h2 className="text-lg">Namada Transparent to Namada Shielded</h2>
      </header>
      <TransferModule
        source={{
          isLoadingAssets,
          availableAssets,
          selectedAssetAddress,
          availableAmount: selectedAsset?.amount,
          chain: namadaChain as Chain,
          availableWallets: [wallets.namada],
          wallet: wallets.namada,
          walletAddress: sourceAddress,
          onChangeSelectedAsset,
          amount: displayAmount,
          onChangeAmount: setDisplayAmount,
        }}
        destination={{
          chain: namadaChain as Chain,
          availableWallets: [wallets.namada],
          wallet: wallets.namada,
          walletAddress: destinationAddress,
          isShielded: true,
        }}
        feeProps={feeProps}
        isSubmitting={isPerformingTransfer || isSuccess}
        errorMessage={generalErrorMessage || error?.message}
        currentStatus={currentStatus}
        currentStatusExplanation={currentStatusExplanation}
        onSubmitTransfer={onSubmitTransfer}
        buttonTextErrors={{
          NoAmount: "Define an amount to shield",
        }}
      />
    </Panel>
  );
};
