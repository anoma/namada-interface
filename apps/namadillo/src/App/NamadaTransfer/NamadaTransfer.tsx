import { Chain } from "@chain-registry/types";
import { Panel } from "@namada/components";
import { AccountType } from "@namada/types";
import { params } from "App/routes";
import { isShieldedAddress } from "App/Transfer/common";
import {
  OnSubmitTransferParams,
  TransferModule,
} from "App/Transfer/TransferModule";
import { allDefaultAccountsAtom } from "atoms/accounts";
import {
  namadaShieldedAssetsAtom,
  namadaTransparentAssetsAtom,
} from "atoms/balance/atoms";
import { chainParametersAtom } from "atoms/chain/atoms";
import { ledgerStatusDataAtom } from "atoms/ledger";
import { rpcUrlAtom } from "atoms/settings";
import BigNumber from "bignumber.js";
import { useTransactionActions } from "hooks/useTransactionActions";
import { useTransfer } from "hooks/useTransfer";
import { useUrlState } from "hooks/useUrlState";
import { wallets } from "integrations";
import invariant from "invariant";
import { useAtom, useAtomValue } from "jotai";
import { createTransferDataFromNamada } from "lib/transactions";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import namadaChain from "registry/namada.json";
import { twMerge } from "tailwind-merge";
import { NamadaTransferTopHeader } from "./NamadaTransferTopHeader";

export const NamadaTransfer: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [displayAmount, setDisplayAmount] = useState<BigNumber | undefined>();
  const [customAddress, setCustomAddress] = useState<string>("");
  const [generalErrorMessage, setGeneralErrorMessage] = useState("");
  const [currentStatus, setCurrentStatus] = useState("");
  const [currentStatusExplanation, setCurrentStatusExplanation] = useState("");

  const shieldedParam = searchParams.get(params.shielded);
  const shielded = shieldedParam ? shieldedParam === "1" : true;

  const rpcUrl = useAtomValue(rpcUrlAtom);
  const chainParameters = useAtomValue(chainParametersAtom);
  const defaultAccounts = useAtomValue(allDefaultAccountsAtom);
  const [ledgerStatus, setLedgerStatusStop] = useAtom(ledgerStatusDataAtom);

  const { data: availableAssets, isLoading: isLoadingAssets } = useAtomValue(
    shielded ? namadaShieldedAssetsAtom : namadaTransparentAssetsAtom
  );

  const { storeTransaction } = useTransactionActions();

  const ledgerAccountInfo = ledgerStatus && {
    deviceConnected: ledgerStatus.connected,
    errorMessage: ledgerStatus.errorMessage,
  };

  const chainId = chainParameters.data?.chainId;
  const account = defaultAccounts.data?.find((account) =>
    shielded ?
      account.type === AccountType.ShieldedKeys
    : account.type !== AccountType.ShieldedKeys
  );
  const sourceAddress = account?.address;
  const [selectedAssetAddress, setSelectedAssetAddress] = useUrlState(
    params.asset
  );
  const selectedAsset =
    selectedAssetAddress ? availableAssets?.[selectedAssetAddress] : undefined;
  const source = sourceAddress ?? "";
  const target = customAddress ?? "";

  const {
    execute: performTransfer,
    isPending: isPerformingTransfer,
    isSuccess: isTransferSuccessful,
    txKind,
    feeProps,
    completedAt,
    redirectToTransactionPage,
  } = useTransfer({
    source,
    target,
    token: selectedAsset?.originalAddress ?? "",
    displayAmount: displayAmount ?? new BigNumber(0),
    onBeforeBuildTx: () => {
      setCurrentStatus("Generating MASP Parameters...");
      setCurrentStatusExplanation(
        "Generating MASP parameters can take a few seconds. Please wait..."
      );
    },
    onBeforeSign: () => {
      setCurrentStatus("Waiting for signature...");
      setCurrentStatusExplanation("");
    },
    onBeforeBroadcast: async () => {
      setCurrentStatus("Broadcasting transaction to Namada...");
    },
    onError: async () => {
      setCurrentStatus("");
      setCurrentStatusExplanation("");
    },
    asset: selectedAsset?.asset,
  });

  const isSourceShielded = isShieldedAddress(source);
  const isTargetShielded = isShieldedAddress(target);

  const onChangeShielded = (isShielded: boolean): void => {
    setSearchParams(
      (currentParams) => {
        const newParams = new URLSearchParams(currentParams);
        newParams.set(params.shielded, isShielded ? "1" : "0");
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
      invariant(sourceAddress, "Source address is not defined");
      invariant(chainId, "Chain ID is undefined");
      invariant(selectedAsset, "No asset is selected");
      invariant(
        sourceAddress !== customAddress,
        "The recipient address must differ from the sender address"
      );

      const txResponse = await performTransfer({ memo });
      if (txResponse) {
        const txList = createTransferDataFromNamada(
          txKind,
          selectedAsset.asset,
          rpcUrl,
          isTargetShielded,
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

  // We stop the ledger status check when the transfer is in progress
  setLedgerStatusStop(isPerformingTransfer);

  return (
    <Panel className="min-h-[600px] rounded-sm flex flex-col flex-1 py-20">
      <header className="flex flex-col items-center text-center mb-3 gap-6">
        <h1
          className={twMerge("mt-6 text-xl", isSourceShielded && "text-yellow")}
        >
          Send
        </h1>
        <NamadaTransferTopHeader
          isSourceShielded={isSourceShielded}
          isDestinationShielded={target ? isTargetShielded : undefined}
        />
        <h2 className="text-md mb-5">
          Send assets to other accounts.
          <br />
          Sending from Namada Shielded to Namada Shielded is fully private
        </h2>
      </header>
      <TransferModule
        source={{
          isLoadingAssets,
          availableAssets,
          availableAmount: selectedAsset?.amount,
          chain: namadaChain as Chain,
          availableWallets: [wallets.namada],
          wallet: wallets.namada,
          walletAddress: sourceAddress,
          selectedAssetAddress,
          onChangeSelectedAsset: setSelectedAssetAddress,
          isShieldedAddress: shielded,
          onChangeShielded,
          amount: displayAmount,
          onChangeAmount: setDisplayAmount,
          ledgerAccountInfo,
        }}
        destination={{
          chain: namadaChain as Chain,
          enableCustomAddress: true,
          customAddress,
          onChangeCustomAddress: setCustomAddress,
          wallet: wallets.namada,
          walletAddress: customAddress,
          isShieldedAddress: isShieldedAddress(customAddress),
        }}
        feeProps={feeProps}
        currentStatus={currentStatus}
        currentStatusExplanation={currentStatusExplanation}
        isShieldedTx={isSourceShielded}
        isSubmitting={
          isPerformingTransfer || isTransferSuccessful || Boolean(completedAt)
        }
        errorMessage={generalErrorMessage}
        onSubmitTransfer={onSubmitTransfer}
        completedAt={completedAt}
        onComplete={redirectToTransactionPage}
      />
    </Panel>
  );
};
