import { Chain } from "@chain-registry/types";
import { Panel } from "@namada/components";
import { AccountType } from "@namada/types";
import { Timeline } from "App/Common/Timeline";
import { params } from "App/routes";
import { TransferModule } from "App/Transfer/TransferModule";
import { allDefaultAccountsAtom } from "atoms/accounts";
import { namadaTransparentAssetsAtom } from "atoms/balance/atoms";
import { chainParametersAtom } from "atoms/chain/atoms";
import { rpcUrlAtom } from "atoms/settings";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useTransactionActions } from "hooks/useTransactionActions";
import { useTransfer } from "hooks/useTransfer";
import { wallets } from "integrations";
import { getAssetImageUrl } from "integrations/utils";
import invariant from "invariant";
import { useAtomValue } from "jotai";
import { createTransferDataFromNamada } from "lib/transactions";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import namadaChain from "registry/namada.json";
import { Address, PartialTransferTransactionData, TransferStep } from "types";
import { MaspTopHeader } from "./MaspTopHeader";

export const MaspShield: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const rpcUrl = useAtomValue(rpcUrlAtom);
  const chainParameters = useAtomValue(chainParametersAtom);
  const defaultAccounts = useAtomValue(allDefaultAccountsAtom);
  const { data: availableAssets, isLoading: isLoadingAssets } = useAtomValue(
    namadaTransparentAssetsAtom
  );

  const [displayAmount, setDisplayAmount] = useState<BigNumber | undefined>();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [generalErrorMessage, setGeneralErrorMessage] = useState("");

  const [transaction, setTransaction] =
    useState<PartialTransferTransactionData>();

  const {
    transactions: myTransactions,
    findByHash,
    storeTransaction,
  } = useTransactionActions();

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
  const source = sourceAddress ?? "";
  const target = destinationAddress ?? "";

  const {
    execute: performTransfer,
    isPending: isPerformingTransfer,
    txKind,
    gasConfig,
  } = useTransfer({
    source,
    target,
    token: selectedAsset?.originalAddress ?? "",
    displayAmount: displayAmount ?? new BigNumber(0),
  });

  const assetImage = selectedAsset ? getAssetImageUrl(selectedAsset.asset) : "";

  useEffect(() => {
    if (transaction?.hash) {
      const tx = findByHash(transaction.hash);
      if (tx) {
        setTransaction(tx);
      }
    }
  }, [myTransactions]);

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
      { replace: false }
    );
  };

  const onSubmitTransfer = async (): Promise<void> => {
    try {
      setGeneralErrorMessage("");
      setCurrentStepIndex(1);

      invariant(sourceAddress, "Source address is not defined");
      invariant(chainId, "Chain ID is undefined");
      invariant(selectedAsset, "No asset is selected");
      invariant(gasConfig, "No gas config");

      setTransaction({
        type: "TransparentToShielded",
        currentStep: TransferStep.Sign,
        asset: selectedAsset.asset,
        chainId,
      });

      const txResponse = await performTransfer();

      if (txResponse) {
        const txList = createTransferDataFromNamada(
          txKind,
          selectedAsset.asset,
          rpcUrl,
          txResponse
        );

        // Currently we don't have the option of batching transfer transactions
        if (txList.length === 0) {
          throw "Couldn't create TransferData object ";
        }

        const tx = txList[0];
        setTransaction(tx);
        storeTransaction(tx);
      } else {
        throw "Invalid transaction response";
      }
    } catch (err) {
      setGeneralErrorMessage(err + "");
      setTransaction(undefined);
    }
  };

  return (
    <Panel className="pt-8 pb-20">
      <header className="flex flex-col items-center text-center mb-3 gap-6">
        <h1 className="text-yellow text-lg">Shield</h1>
        <MaspTopHeader type="shield" isShielded />
        <h2 className="text-lg">Namada Transparent to Namada Shielded</h2>
      </header>
      <AnimatePresence>
        {currentStepIndex === 0 && (
          <motion.div
            key="transfer"
            exit={{ opacity: 0 }}
            className="min-h-[600px]"
          >
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
              gasConfig={gasConfig}
              isSubmitting={isPerformingTransfer}
              errorMessage={generalErrorMessage}
              onSubmitTransfer={onSubmitTransfer}
            />
          </motion.div>
        )}
        {currentStepIndex > 0 && transaction?.currentStep && (
          <motion.div
            key="progress"
            className={clsx("my-12 text-yellow")}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Timeline
              currentStepIndex={currentStepIndex}
              steps={[
                {
                  children: <img src={assetImage} className="w-14" />,
                },
                { children: "Signature Required", bullet: true },
                {
                  children: (
                    <>
                      <img src={assetImage} className="w-14 mb-2" />
                      Shielded Transfer Complete
                    </>
                  ),
                },
              ]}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Panel>
  );
};
