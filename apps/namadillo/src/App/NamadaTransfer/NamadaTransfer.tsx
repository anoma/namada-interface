import { Chain } from "@chain-registry/types";
import { Panel } from "@namada/components";
import { AccountType } from "@namada/types";
import { params, routes } from "App/routes";
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
import { applicationFeaturesAtom, rpcUrlAtom } from "atoms/settings";
import BigNumber from "bignumber.js";
import { useTransactionActions } from "hooks/useTransactionActions";
import { useTransfer } from "hooks/useTransfer";
import { wallets } from "integrations";
import invariant from "invariant";
import { useAtomValue } from "jotai";
import { createTransferDataFromNamada } from "lib/transactions";
import { useMemo, useState } from "react";
import { generatePath, useNavigate, useSearchParams } from "react-router-dom";
import namadaChain from "registry/namada.json";
import { twMerge } from "tailwind-merge";
import { Address, TransferTransactionData } from "types";
import { isNamadaAsset } from "utils";
import { NamadaTransferTopHeader } from "./NamadaTransferTopHeader";

export const NamadaTransfer: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [displayAmount, setDisplayAmount] = useState<BigNumber | undefined>();
  const [shielded, setShielded] = useState<boolean>(true);
  const [customAddress, setCustomAddress] = useState<string>("");
  const [generalErrorMessage, setGeneralErrorMessage] = useState("");

  const rpcUrl = useAtomValue(rpcUrlAtom);
  const features = useAtomValue(applicationFeaturesAtom);
  const chainParameters = useAtomValue(chainParametersAtom);
  const defaultAccounts = useAtomValue(allDefaultAccountsAtom);

  const { data: availableAssetsData, isLoading: isLoadingAssets } =
    useAtomValue(
      shielded ? namadaShieldedAssetsAtom : namadaTransparentAssetsAtom
    );

  const { storeTransaction } = useTransactionActions();

  const availableAssets = useMemo(() => {
    if (features.namTransfersEnabled) {
      return availableAssetsData;
    }
    const assetsMap = { ...availableAssetsData };
    const namadaAsset = Object.values(availableAssetsData ?? {}).find((a) =>
      isNamadaAsset(a.asset)
    );
    if (namadaAsset?.originalAddress) {
      delete assetsMap[namadaAsset?.originalAddress]; // NAM will be available only on phase 5
    }
    return assetsMap;
  }, [availableAssetsData]);

  const chainId = chainParameters.data?.chainId;
  const account = defaultAccounts.data?.find((account) =>
    shielded ?
      account.type === AccountType.ShieldedKeys
    : account.type !== AccountType.ShieldedKeys
  );
  const sourceAddress = account?.address;
  const selectedAssetAddress = searchParams.get(params.asset) || undefined;
  const selectedAsset =
    selectedAssetAddress ? availableAssets?.[selectedAssetAddress] : undefined;
  const source = sourceAddress ?? "";
  const target = customAddress ?? "";

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

  const isSourceShielded = isShieldedAddress(source);
  const isTargetShielded = isShieldedAddress(target);

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

  const redirectToTimeline = (tx: TransferTransactionData): void => {
    invariant(tx.hash, "Invalid TX hash");
    navigate(generatePath(routes.transaction, { hash: tx.hash }));
  };

  const onSubmitTransfer = async ({
    memo,
  }: OnSubmitTransferParams): Promise<void> => {
    try {
      setGeneralErrorMessage("");

      invariant(sourceAddress, "Source address is not defined");
      invariant(chainId, "Chain ID is undefined");
      invariant(selectedAsset, "No asset is selected");
      invariant(gasConfig, "No gas config");
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
          txResponse,
          memo
        );

        // Currently we don't have the option of batching transfer transactions
        if (txList.length === 0) {
          throw "Couldn't create TransferData object";
        }

        const tx = txList[0];
        storeTransaction(tx);
        redirectToTimeline(tx);
      } else {
        throw "Invalid transaction response";
      }
    } catch (err) {
      setGeneralErrorMessage(err + "");
    }
  };

  return (
    <Panel className="relative min-h-[600px]">
      <header className="flex flex-col items-center text-center mb-3 gap-6">
        <h1
          className={twMerge("mt-6 text-lg", isSourceShielded && "text-yellow")}
        >
          Transfer
        </h1>
        <NamadaTransferTopHeader
          isSourceShielded={isSourceShielded}
          isDestinationShielded={target ? isTargetShielded : undefined}
        />
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
          onChangeSelectedAsset,
          isShielded: shielded,
          onChangeShielded: setShielded,
          amount: displayAmount,
          onChangeAmount: setDisplayAmount,
        }}
        destination={{
          chain: namadaChain as Chain,
          enableCustomAddress: true,
          customAddress,
          onChangeCustomAddress: setCustomAddress,
        }}
        gasConfig={gasConfig}
        isSubmitting={isPerformingTransfer}
        errorMessage={generalErrorMessage}
        onSubmitTransfer={onSubmitTransfer}
      />
    </Panel>
  );
};
