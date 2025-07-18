import { AccountType } from "@namada/types";
import { mapUndefined } from "@namada/utils";
import { routes } from "App/routes";
import { isShieldedAddress } from "App/Transfer/common";
import { TransferModule } from "App/Transfer/TransferModule";
import { OnSubmitTransferParams } from "App/Transfer/types";
import { allDefaultAccountsAtom } from "atoms/accounts";
import {
  assetBalanceAtomFamily,
  ibcChannelsFamily,
  SUPPORTED_ASSETS_MAP,
} from "atoms/integrations";
import BigNumber from "bignumber.js";
import { useFathomTracker } from "hooks/useFathomTracker";
import { useIbcTransaction } from "hooks/useIbcTransaction";
import { useTransactionActions } from "hooks/useTransactionActions";
import { useWalletManager } from "hooks/useWalletManager";
import { KeplrWalletManager } from "integrations/Keplr";
import invariant from "invariant";
import { useAtomValue } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { generatePath, useNavigate } from "react-router-dom";
import { AssetWithAmount } from "types";
import { useTransactionEventListener } from "utils";
import { IbcTabNavigation } from "./IbcTabNavigation";
import { IbcTopHeader } from "./IbcTopHeader";

const keplr = new KeplrWalletManager();

export const IbcTransfer = (): JSX.Element => {
  const navigate = useNavigate();
  const [completedAt, setCompletedAt] = useState<Date | undefined>();
  const [sourceChannel, setSourceChannel] = useState("");
  const [destinationChannel, setDestinationChannel] = useState("");
  const defaultAccounts = useAtomValue(allDefaultAccountsAtom);

  // Wallet & Registry
  const { registry, walletAddress: keplrSourceAddress } =
    useWalletManager(keplr);
  const [sourceAddress, setSourceAddress] = useState<string>(
    keplrSourceAddress ?? ""
  );
  const [destinationAddress, setDestinationAddress] = useState<string>("");

  const [selectedAssetWithAmount, setSelectedAssetWithAmount] = useState<
    AssetWithAmount | undefined
  >();
  // IBC Channels & Balances
  const {
    data: ibcChannels,
    isError: unknownIbcChannels,
    isLoading: isLoadingIbcChannels,
  } = useAtomValue(ibcChannelsFamily(registry?.chain.chain_name));

  const { data: userAssets, isLoading: isLoadingBalances } = useAtomValue(
    assetBalanceAtomFamily({
      chain: registry?.chain,
      walletAddress: sourceAddress,
    })
  );
  const shielded = isShieldedAddress(destinationAddress ?? "");
  const { trackEvent } = useFathomTracker();
  const [amount, setAmount] = useState<BigNumber | undefined>();
  const [generalErrorMessage, setGeneralErrorMessage] = useState("");
  const [currentStatus, setCurrentStatus] = useState<string>();
  const [txHash, setTxHash] = useState<string | undefined>();

  const availableDisplayAmount = mapUndefined((baseDenom) => {
    return userAssets ? userAssets[baseDenom]?.amount : undefined;
  }, selectedAssetWithAmount?.asset?.address);

  // Manage the history of transactions
  const { storeTransaction } = useTransactionActions();

  // Utils for IBC transfers
  const { transferToNamada, gasConfig } = useIbcTransaction({
    registry,
    sourceAddress,
    sourceChannel,
    destinationChannel,
    shielded,
    selectedAsset: selectedAssetWithAmount?.asset,
  });

  const namadaAddress = useMemo(() => {
    return (
      defaultAccounts.data?.find(
        (account) => (account.type === AccountType.ShieldedKeys) === shielded
      )?.address || ""
    );
  }, [defaultAccounts, shielded]);

  // const selectedAsset =
  //   selectedAssetBase ? userAssets?.[selectedAssetBase]?.asset : undefined;

  const availableAssets = useMemo(() => {
    if (!userAssets || !registry) return undefined;

    //     Object.entries(userAssets).forEach(([key, { asset }]) => {
    //       const namadaAsset = getNamadaAssetByIbcAsset(
    //         asset,
    //         chainRegistry?.assets.assets ?? []
    //       );

    Object.entries(userAssets).forEach(([key, { asset }]) => {
      if (
        SUPPORTED_ASSETS_MAP.get(registry.chain.chain_name)?.includes(
          asset.symbol
        )
      ) {
        output[key] = { ...userAssets[key] };
      }
    });

    return output;
  }, [Object.keys(userAssets || {}).join(""), registry?.chain.chain_name]);
  const requiresIbcChannels = Boolean(
    !isLoadingIbcChannels &&
      (unknownIbcChannels ||
        (shielded && ibcChannels && !ibcChannels?.namadaChannel))
  );

  // useEffect(() => setSelectedAssetBase(undefined), [registry]);

  // Set source and destination channels based on IBC channels data
  useEffect(() => {
    setSourceChannel(ibcChannels?.ibcChannel || "");
    setDestinationChannel(ibcChannels?.namadaChannel || "");
  }, [ibcChannels]);

  useTransactionEventListener("IbcTransfer.Success", (e) => {
    if (txHash && e.detail.hash === txHash) {
      setCompletedAt(new Date());
      trackEvent(
        `${shielded ? "Shielded " : ""}IbcTransfer: tx complete (${e.detail.asset.symbol})`
      );
    }
  });

  useTransactionEventListener("IbcTransfer.Error", (e) => {
    trackEvent(
      `${shielded ? "Shielded " : ""}IbcTransfer: tx error (${e.detail.asset.symbol})`
    );
  });

  const onSubmitTransfer = async ({
    displayAmount,
    destinationAddress,
    memo,
  }: OnSubmitTransferParams): Promise<void> => {
    try {
      invariant(registry?.chain, "Error: Chain not selected");
      setGeneralErrorMessage("");
      setCurrentStatus("Submitting...");
      const result = await transferToNamada.mutateAsync({
        destinationAddress: destinationAddress ?? "",
        displayAmount: new BigNumber(displayAmount ?? "0"),
        memo,
        onUpdateStatus: setCurrentStatus,
      });
      storeTransaction(result);
      setTxHash(result.hash);
      trackEvent(
        `${shielded ? "Shielded " : ""}IbcTransfer: tx submitted (${result.asset.symbol})`
      );
    } catch (err) {
      setGeneralErrorMessage(err + "");
      setCurrentStatus(undefined);
    }
  };

  return (
    <div className="relative min-h-[600px]">
      <header className="flex flex-col items-center text-center mb-8 gap-6">
        <IbcTopHeader type="ibcToNam" isShielded={shielded} />
      </header>
      <div className="mb-6">{!completedAt && <IbcTabNavigation />}</div>
      <TransferModule
        source={{
          selectedAssetWithAmount,
          availableAmount: availableDisplayAmount,
          address: sourceAddress,
          onChangeSelectedAsset: setSelectedAssetWithAmount,
          onChangeAddress: setSourceAddress,
          amount,
          onChangeAmount: setAmount,
        }}
        destination={{
          address: namadaAddress,
          isShieldedAddress: shielded,
          onChangeAddress: setDestinationAddress,
        }}
        gasConfig={gasConfig.data}
        isSubmitting={
          transferToNamada.isPending ||
          /* isSuccess means that the transaction has been broadcasted, but doesn't take
           * in consideration if it was applied to Namada chain, or releayed successfully.
           * In order to get this confirmation, we poll the RPC endpoint on useTransactionWatcher hook. */
          transferToNamada.isSuccess
        }
        completedAt={completedAt}
        currentStatus={currentStatus ?? ""}
        requiresIbcChannels={requiresIbcChannels}
        ibcChannels={{
          sourceChannel,
          destinationChannel,
          onChangeSourceChannel: setSourceChannel,
          onChangeDestinationChannel: setDestinationChannel,
        }}
        errorMessage={generalErrorMessage || transferToNamada.error?.message}
        onSubmitTransfer={onSubmitTransfer}
        onComplete={() => {
          txHash &&
            navigate(generatePath(routes.transaction, { hash: txHash }));
        }}
      />
    </div>
  );
};
