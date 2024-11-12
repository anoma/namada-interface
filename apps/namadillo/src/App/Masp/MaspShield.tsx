import { Chain } from "@chain-registry/types";
import { Panel } from "@namada/components";
import { TransactionTimeline } from "App/Common/TransactionTimeline";
import { params } from "App/routes";
import {
  OnSubmitTransferParams,
  TransferModule,
} from "App/Transfer/TransferModule";
import { allDefaultAccountsAtom } from "atoms/accounts";
import { namadaTransparentAssetsAtom } from "atoms/balance/atoms";
import { chainParametersAtom } from "atoms/chain/atoms";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { wallets } from "integrations";
import { getAssetImageUrl } from "integrations/utils";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import namadaChain from "registry/namada.json";
import { Address } from "types";
import { MaspTopHeader } from "./MaspTopHeader";

export const MaspShield: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const chainParameters = useAtomValue(chainParametersAtom);
  const defaultAccounts = useAtomValue(allDefaultAccountsAtom);
  const { data: availableAssets, isLoading: isLoadingBalances } = useAtomValue(
    namadaTransparentAssetsAtom
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [generalErrorMessage, setGeneralErrorMessage] = useState("");

  const chainId = chainParameters.data?.chainId;

  const sourceAddress = defaultAccounts.data?.find(
    (account) => !account.isShielded
  )?.address;
  const destinationAddress = defaultAccounts.data?.find(
    (account) => account.isShielded
  )?.address;

  const selectedAssetAddress = searchParams.get(params.asset) || undefined;
  const selectedAsset =
    selectedAssetAddress ? availableAssets?.[selectedAssetAddress] : undefined;

  const transactionFee =
    selectedAsset ?
      // TODO: remove hardcoding
      { ...selectedAsset, amount: BigNumber(0.03) }
    : undefined;

  const assetImage = selectedAsset ? getAssetImageUrl(selectedAsset.asset) : "";

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

      if (typeof transactionFee === "undefined") {
        throw new Error("No transaction fee is set");
      }

      // TODO do the transaction
      alert(
        "// TODO \n" + JSON.stringify({ amount, destinationAddress }, null, 2)
      );

      setCurrentStep(2);
    } catch (err) {
      setGeneralErrorMessage(err + "");
      setCurrentStep(0);
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
        {currentStep === 0 && (
          <motion.div
            key="transfer"
            exit={{ opacity: 0 }}
            className="min-h-[600px]"
          >
            <TransferModule
              source={{
                isLoadingAssets: isLoadingBalances,
                availableAssets,
                selectedAssetAddress,
                availableAmount: selectedAsset?.amount,
                chain: namadaChain as Chain,
                availableWallets: [wallets.namada!],
                wallet: wallets.namada,
                walletAddress: sourceAddress,
                onChangeSelectedAsset,
              }}
              destination={{
                chain: namadaChain as Chain,
                availableWallets: [wallets.namada!],
                wallet: wallets.namada,
                walletAddress: destinationAddress,
                isShielded: true,
              }}
              transactionFee={transactionFee}
              // TODO
              // isSubmitting={something.isPending}
              errorMessage={generalErrorMessage}
              onSubmitTransfer={onSubmitTransfer}
            />
          </motion.div>
        )}
        {currentStep > 0 && (
          <motion.div
            key="progress"
            className={clsx("my-12 text-yellow")}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <TransactionTimeline
              currentStepIndex={currentStep}
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
