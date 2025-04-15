import { Chain } from "@chain-registry/types";
import { Panel, Stack } from "@namada/components";
import { AccountType } from "@namada/types";
import { IbcTransfer } from "App/Ibc/IbcTransfer";
import { NamadaTransferTopHeader } from "App/NamadaTransfer/NamadaTransferTopHeader";
import { params } from "App/routes";
import {
  OnSubmitTransferParams,
  TransferModule,
} from "App/Transfer/TransferModule";
import { allDefaultAccountsAtom } from "atoms/accounts";
import { namadaTransparentAssetsAtom } from "atoms/balance/atoms";
import { chainParametersAtom } from "atoms/chain/atoms";
import { ledgerStatusDataAtom } from "atoms/ledger";
import { rpcUrlAtom } from "atoms/settings";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { useTransactionActions } from "hooks/useTransactionActions";
import { useTransfer } from "hooks/useTransfer";
import { useUrlState } from "hooks/useUrlState";
import { wallets } from "integrations";
import { getAssetImageUrl } from "integrations/utils";
import invariant from "invariant";
import { useAtom, useAtomValue } from "jotai";
import { createTransferDataFromNamada } from "lib/transactions";
import { useState } from "react";
import namadaChain from "registry/namada.json";
import { namadaAsset } from "utils";

type ShieldingOptionCardProps = {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  children: React.ReactNode;
};

const ShieldingOptionCard = ({
  title,
  icon,
  children,
  onClick,
}: ShieldingOptionCardProps): JSX.Element => {
  return (
    <Stack
      gap={6}
      onClick={onClick}
      className={clsx(
        "w-[220px] h-full items-stretch pb-8 pt-2.5 px-4 border rounded-md border-transparent transition-colors cursor-pointer",
        "items-center text-white text-center hover:border-yellow"
      )}
    >
      <h3 className="text-xl font-medium">{title}</h3>
      <aside className="max-w-[78px]">{icon}</aside>
      <div className="text-base/tight">{children}</div>
    </Stack>
  );
};

type ShieldingOption = "ibc" | "internal" | null;

export const MaspShield: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<ShieldingOption>(null);
  const { storeTransaction } = useTransactionActions();
  const [displayAmount, setDisplayAmount] = useState<BigNumber | undefined>();
  const [generalErrorMessage, setGeneralErrorMessage] = useState("");
  const [currentStatus, setCurrentStatus] = useState("");
  const [currentStatusExplanation, setCurrentStatusExplanation] = useState("");

  const rpcUrl = useAtomValue(rpcUrlAtom);
  const chainParameters = useAtomValue(chainParametersAtom);
  const defaultAccounts = useAtomValue(allDefaultAccountsAtom);
  const [ledgerStatus, setLedgerStatusStop] = useAtom(ledgerStatusDataAtom);
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

  const [selectedAssetAddress, setSelectedAssetAddress] = useUrlState(
    params.asset
  );
  const selectedAsset =
    selectedAssetAddress ? availableAssets?.[selectedAssetAddress] : undefined;

  const ledgerAccountInfo = ledgerStatus && {
    deviceConnected: ledgerStatus.connected,
    errorMessage: ledgerStatus.errorMessage,
  };

  const {
    execute: performTransfer,
    isPending: isPerformingTransfer,
    isSuccess,
    error,
    txKind,
    feeProps,
    completedAt,
    redirectToTransactionPage,
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
    onBeforeBroadcast: async () => {
      setCurrentStatus("Broadcasting Shielding transaction...");
    },
    onError: async () => {
      setCurrentStatus("");
      setCurrentStatusExplanation("");
    },
    asset: selectedAsset?.asset,
  });

  // We stop the ledger status check when the transfer is in progress
  setLedgerStatusStop(isPerformingTransfer);

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

  // If no option is selected, show the selection screen
  if (selectedOption === null) {
    return (
      <Panel className="relative rounded-none">
        <header className="flex flex-col items-center text-center mb-6 gap-6">
          <h1 className="mt-20 text-lg text-yellow">Shield Assets</h1>
          <h2 className="text-sm">Select an option to shield your assets</h2>
        </header>

        <div className="flex justify-center gap-8 pt-4 pb-8">
          <ShieldingOptionCard
            title="IBC Shield"
            icon={<img src={wallets.keplr.iconUrl} className="w-full" />}
            onClick={() => setSelectedOption("ibc")}
          >
            Shield external assets over IBC to Namada
          </ShieldingOptionCard>

          <div className="w-px bg-white -my-1" />

          <ShieldingOptionCard
            title="Internal Shield"
            icon={
              <span className="flex w-full bg-yellow rounded-md">
                <img src={getAssetImageUrl(namadaAsset())} className="w-full" />
              </span>
            }
            onClick={() => setSelectedOption("internal")}
          >
            Shield Assets from your Namada transparent account
          </ShieldingOptionCard>
        </div>
      </Panel>
    );
  }

  // Show the selected shielding option component
  if (selectedOption === "ibc") {
    return (
      <Panel className="relative rounded-none">
        <header className="flex flex-col items-center text-center mb-3 gap-6">
          <button
            className="self-start px-4 py-1 rounded-md text-yellow hover:bg-gray-800 transition-colors"
            onClick={() => setSelectedOption(null)}
          >
            ← Back
          </button>
          <h1 className="-mt-8 text-lg text-yellow">Shielding Transfer</h1>
          <h2 className="text-sm">
            Shield IBC assets into Namada&apos;s Shieldpool
          </h2>
        </header>
        <IbcTransfer />
      </Panel>
    );
  }

  // Internal shield option
  return (
    <Panel className="relative rounded-none">
      <header className="flex flex-col items-center text-center mb-3 gap-6">
        <button
          className="self-start px-4 py-1 rounded-md text-yellow hover:bg-gray-800 transition-colors"
          onClick={() => setSelectedOption(null)}
        >
          ← Back
        </button>
        <h1 className="-mt-8 text-lg text-yellow">Shielding Transfer</h1>
        <NamadaTransferTopHeader
          isSourceShielded={false}
          isDestinationShielded={true}
        />
        <h2 className="text-sm">Shield assets into Namada&apos;s Shieldpool</h2>
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
          onChangeSelectedAsset: setSelectedAssetAddress,
          amount: displayAmount,
          onChangeAmount: setDisplayAmount,
          ledgerAccountInfo,
        }}
        destination={{
          chain: namadaChain as Chain,
          availableWallets: [wallets.namada],
          wallet: wallets.namada,
          walletAddress: destinationAddress,
          isShieldedAddress: true,
        }}
        feeProps={feeProps}
        isSubmitting={isPerformingTransfer || isSuccess}
        errorMessage={generalErrorMessage || error?.message}
        currentStatus={currentStatus}
        currentStatusExplanation={currentStatusExplanation}
        onSubmitTransfer={onSubmitTransfer}
        completedAt={completedAt}
        buttonTextErrors={{
          NoAmount: "Define an amount to shield",
        }}
        onComplete={redirectToTransactionPage}
      />
    </Panel>
  );
};
