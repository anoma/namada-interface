import { Chain } from "@chain-registry/types";
import { Panel } from "@namada/components";
import { Timeline } from "App/Common/Timeline";
import { params } from "App/routes";
import { isShieldedAddress } from "App/Transfer/common";
import {
  OnSubmitTransferParams,
  TransactionFee,
  TransferModule,
} from "App/Transfer/TransferModule";
import { allDefaultAccountsAtom } from "atoms/accounts";
import { namadaTransparentAssetsAtom } from "atoms/balance/atoms";
import { chainParametersAtom } from "atoms/chain/atoms";
import {
  createShieldedTransferAtom,
  createShieldingTransferAtom,
  createTransparentTransferAtom,
  createUnshieldingTransferAtom,
} from "atoms/transfer/atoms";
import BigNumber from "bignumber.js";
import { AnimatePresence, motion } from "framer-motion";
import { useTransaction } from "hooks/useTransaction";
import { useTransactionActions } from "hooks/useTransactionActions";
import { wallets } from "integrations";
import { getAssetImageUrl } from "integrations/utils";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import namadaChain from "registry/namada.json";
import { twMerge } from "tailwind-merge";
import {
  Address,
  NamadaTransferTxKind,
  PartialTransferTransactionData,
  TransferStep,
  TransferTransactionData,
} from "types";
import arrowImage from "./assets/arrow.svg";
import shieldedAccountImage from "./assets/shielded-account.svg";
import transparentAccountImage from "./assets/transparent-account.svg";

export const NamadaTransfer: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const chainParameters = useAtomValue(chainParametersAtom);
  const defaultAccounts = useAtomValue(allDefaultAccountsAtom);
  const { data: availableAssets, isLoading: isLoadingAssets } = useAtomValue(
    namadaTransparentAssetsAtom
  );

  const [amount, setAmount] = useState<BigNumber | undefined>();
  const [shielded, setShielded] = useState<boolean>(true);
  const [customAddress, setCustomAddress] = useState<string>("");
  const [currentStep, setCurrentStep] = useState(0);
  const [generalErrorMessage, setGeneralErrorMessage] = useState("");

  const [transaction, setTransaction] =
    useState<PartialTransferTransactionData>();

  const {
    transactions: myTransactions,
    findByHash,
    storeTransaction,
  } = useTransactionActions();

  const chainId = chainParameters.data?.chainId;

  const sourceAddress = defaultAccounts.data?.find((account) =>
    shielded ? account.isShielded : !account.isShielded
  )?.address;

  const selectedAssetAddress = searchParams.get(params.asset) || undefined;
  const selectedAsset =
    selectedAssetAddress ? availableAssets?.[selectedAssetAddress] : undefined;

  const token = selectedAsset?.originalAddress ?? "";
  const source = sourceAddress ?? "";
  const target = customAddress ?? "";

  const commomProps = {
    parsePendingTxNotification: () => ({
      title: "Transfer transaction in progress",
      description: "Your transfer transaction is being processed",
    }),
    parseErrorTxNotification: () => ({
      title: "Transfer transaction failed",
      description: "",
    }),
  };

  const transparentTransaction = useTransaction({
    eventType: "TransparentTransfer",
    createTxAtom: createTransparentTransferAtom,
    params: [{ data: [{ source, target, token, amount }] }],
    ...commomProps,
  });

  const shieldedTransaction = useTransaction({
    eventType: "ShieldedTransfer",
    createTxAtom: createShieldedTransferAtom,
    params: [{ data: [{ source, target, token, amount }] }],
    ...commomProps,
  });

  const shieldingTransaction = useTransaction({
    eventType: "ShieldingTransfer",
    createTxAtom: createShieldingTransferAtom,
    params: [{ target, data: [{ source, token, amount }] }],
    ...commomProps,
  });

  const unshieldingTransaction = useTransaction({
    eventType: "UnshieldingTransfer",
    createTxAtom: createUnshieldingTransferAtom,
    params: [{ source, data: [{ target, token, amount }] }],
    ...commomProps,
  });

  const getAddressKind = (address: Address): "Shielded" | "Transparent" =>
    isShieldedAddress(address) ? "Shielded" : "Transparent";

  const txKind: NamadaTransferTxKind = `${getAddressKind(source)}To${getAddressKind(target)}`;

  const {
    execute: performTransfer,
    gasConfig,
    isPending: isPerformingTransfer,
  } = (() => {
    switch (txKind) {
      case "TransparentToTransparent":
        return transparentTransaction;
      case "TransparentToShielded":
        return shieldingTransaction;
      case "ShieldedToTransparent":
        return unshieldingTransaction;
      case "ShieldedToShielded":
        return shieldedTransaction;
    }
  })();

  const transactionFee: TransactionFee | undefined =
    selectedAsset && gasConfig ?
      {
        originalAddress: selectedAsset.originalAddress,
        asset: selectedAsset.asset,
        amount: gasConfig.gasPrice.multipliedBy(gasConfig.gasLimit),
      }
    : undefined;

  const isSourceShielded = isShieldedAddress(source);
  const isTargetShielded = isShieldedAddress(target);
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

  const onSubmitTransfer = async ({
    amount,
    destinationAddress,
  }: OnSubmitTransferParams): Promise<void> => {
    try {
      setGeneralErrorMessage("");
      setCurrentStep(1);

      if (typeof sourceAddress === "undefined") {
        throw new Error("Source address is not defined");
      }

      if (!chainId) {
        throw new Error("Chain ID is undefined");
      }

      if (!selectedAsset) {
        throw new Error("No asset is selected");
      }

      if (typeof gasConfig === "undefined") {
        throw new Error("No gas config");
      }

      setTransaction({
        type: txKind,
        currentStep: TransferStep.Sign,
        asset: selectedAsset.asset,
        chainId,
      });

      const txResponse = await performTransfer();

      // TODO review and improve this data to be more precise and full of details
      const tx: TransferTransactionData = {
        type: txKind,
        currentStep: TransferStep.Complete,
        sourceAddress: source,
        destinationAddress,
        asset: selectedAsset.asset,
        amount,
        rpc: "", // TODO
        chainId: txResponse?.encodedTxData.txs[0]?.args.chainId ?? "",
        hash: txResponse?.encodedTxData.txs[0].hash,
        feePaid: txResponse?.encodedTxData.txs[0].args.feeAmount,
        resultTxHash: txResponse?.encodedTxData.txs[0].hash,
        status: "success",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setTransaction(tx);
      storeTransaction(tx);

      setCurrentStep(2);
    } catch (err) {
      setGeneralErrorMessage(err + "");
      setCurrentStep(0);
    }
  };

  return (
    <Panel className="pt-8 pb-20">
      <header className="flex flex-col items-center text-center mb-8 gap-6">
        <h1 className={twMerge("text-lg", isSourceShielded && "text-yellow")}>
          Transfer
        </h1>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <img
            src={shielded ? shieldedAccountImage : transparentAccountImage}
            alt=""
            className="flex-1 h-[35px] w-[35px]"
          />
          <img src={arrowImage} alt="" className="flex-1 w-[72px]" />
          <div />
        </div>
      </header>
      <AnimatePresence>
        {currentStep === 0 && (
          <motion.div
            key="transfer"
            exit={{ opacity: 0 }}
            className="min-h-[600px]"
          >
            <TransferModule
              source={{
                isLoadingAssets,
                availableAssets,
                availableAmount: selectedAsset?.amount,
                chain: namadaChain as Chain,
                availableWallets: [wallets.namada!],
                wallet: wallets.namada,
                walletAddress: sourceAddress,
                selectedAssetAddress,
                onChangeSelectedAsset,
                isShielded: shielded,
                onChangeShielded: setShielded,
                amount,
                onChangeAmount: setAmount,
              }}
              destination={{
                chain: namadaChain as Chain,
                enableCustomAddress: true,
                customAddress,
                onChangeCustomAddress: setCustomAddress,
              }}
              transactionFee={transactionFee}
              isSubmitting={isPerformingTransfer}
              errorMessage={generalErrorMessage}
              onSubmitTransfer={onSubmitTransfer}
            />
          </motion.div>
        )}
        {currentStep > 0 && (
          <motion.div
            key="progress"
            className={twMerge("my-12", isSourceShielded && "text-yellow")}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Timeline
              currentStepIndex={currentStep}
              steps={[
                {
                  children: <img src={assetImage} className="w-14" />,
                },
                {
                  children: (
                    <div className={twMerge(isSourceShielded && "text-yellow")}>
                      Signature Required
                    </div>
                  ),
                  bullet: true,
                },
                {
                  children: (
                    <>
                      <div>
                        Transfer to{" "}
                        {isTargetShielded ?
                          "Namada Shielded"
                        : "Namada Transparent"}
                      </div>
                      <div className="text-xs">{target}</div>
                    </>
                  ),
                  bullet: true,
                },
                {
                  // TODO
                  children: (
                    <div
                      className={twMerge(
                        "flex flex-col items-center",
                        isTargetShielded && "text-yellow"
                      )}
                    >
                      <img src={assetImage} className="w-14 mb-2" />
                      Transfer Complete
                    </div>
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
