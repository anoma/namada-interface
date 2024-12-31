import { Chain } from "@chain-registry/types";
import { AccountType } from "@namada/types";
import { mapUndefined } from "@namada/utils";
import { routes } from "App/routes";
import {
  OnSubmitTransferParams,
  TransferModule,
} from "App/Transfer/TransferModule";
import { allDefaultAccountsAtom } from "atoms/accounts";
import {
  assetBalanceAtomFamily,
  availableChainsAtom,
  ibcChannelsFamily,
} from "atoms/integrations";
import BigNumber from "bignumber.js";
import { useIbcTransaction } from "hooks/useIbcTransaction";
import { useTransactionActions } from "hooks/useTransactionActions";
import { useWalletManager } from "hooks/useWalletManager";
import { wallets } from "integrations";
import { KeplrWalletManager } from "integrations/Keplr";
import invariant from "invariant";
import { useAtomValue } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { generatePath, useNavigate } from "react-router-dom";
import namadaChain from "registry/namada.json";
import { Address, TransferTransactionData } from "types";
import { IbcTopHeader } from "./IbcTopHeader";

const keplr = new KeplrWalletManager();
const defaultChainId = "cosmoshub-4";

export const IbcTransfer = (): JSX.Element => {
  const navigate = useNavigate();

  // Global & Atom states
  const availableChains = useAtomValue(availableChainsAtom);
  const defaultAccounts = useAtomValue(allDefaultAccountsAtom);

  // Wallet & Registry
  const {
    registry,
    walletAddress: sourceAddress,
    connectToChainId,
  } = useWalletManager(keplr);

  // IBC Channels & Balances
  const { data: ibcChannels } = useAtomValue(
    ibcChannelsFamily(registry?.chain.chain_name)
  );

  const { data: userAssets, isLoading: isLoadingBalances } = useAtomValue(
    assetBalanceAtomFamily({
      chain: registry?.chain,
      walletAddress: sourceAddress,
    })
  );
  console.log("userAssets", userAssets);

  // Local State
  const [shielded, setShielded] = useState<boolean>(true);
  const [selectedAssetAddress, setSelectedAssetAddress] = useState<Address>();
  const [amount, setAmount] = useState<BigNumber | undefined>();
  const [generalErrorMessage, setGeneralErrorMessage] = useState("");
  const [sourceChannel, setSourceChannel] = useState("");
  const [destinationChannel, setDestinationChannel] = useState("");

  // Derived data
  const availableAmount = mapUndefined(
    (address) => userAssets?.[address]?.amount,
    selectedAssetAddress
  );

  const selectedAsset = mapUndefined(
    (address) => userAssets?.[address],
    selectedAssetAddress
  );

  // Manage the history of transactions
  const { storeTransaction } = useTransactionActions();

  // Utils for IBC transfers
  const { transferToNamada, gasConfig, transferStatus } = useIbcTransaction({
    registry,
    sourceAddress,
    sourceChannel,
    destinationChannel,
    shielded,
    selectedAsset,
  });

  const redirectToTimeline = (tx: TransferTransactionData): void => {
    invariant(tx.hash, "Invalid TX hash");
    navigate(generatePath(routes.transaction, { hash: tx.hash }));
  };

  const namadaAddress = useMemo(() => {
    return (
      defaultAccounts.data?.find(
        (account) => (account.type === AccountType.ShieldedKeys) === shielded
      )?.address || ""
    );
  }, [defaultAccounts, shielded]);

  const requiresIbcChannels =
    !ibcChannels?.cosmosChannelId ||
    (shielded && !ibcChannels?.namadaChannelId);

  useEffect(() => setSelectedAssetAddress(undefined), [registry]);

  // Set source and destination channels based on IBC channels data
  useEffect(() => {
    setSourceChannel(ibcChannels?.cosmosChannelId || "");
    setDestinationChannel(ibcChannels?.namadaChannelId || "");
  }, [ibcChannels]);

  const onSubmitTransfer = async ({
    displayAmount,
    destinationAddress,
  }: OnSubmitTransferParams): Promise<void> => {
    try {
      setGeneralErrorMessage("");
      const result = await transferToNamada(destinationAddress, displayAmount);
      storeTransaction(result);
      redirectToTimeline(result);
    } catch (err) {
      setGeneralErrorMessage(err + "");
    }
  };

  const onChangeWallet = (): void => {
    if (registry) {
      connectToChainId(registry.chain.chain_id);
      return;
    }
    connectToChainId(defaultChainId);
  };

  const onChangeChain = (chain: Chain): void => {
    connectToChainId(chain.chain_id);
  };

  return (
    <div className="relative min-h-[600px]">
      <header className="flex flex-col items-center text-center mb-3 gap-6">
        <IbcTopHeader type="ibcToNam" isShielded={shielded} />
        <h2 className="text-lg">IBC Transfer to Namada</h2>
      </header>
      <TransferModule
        source={{
          isLoadingAssets: isLoadingBalances,
          availableAssets: userAssets,
          selectedAssetAddress,
          availableAmount,
          availableChains,
          onChangeChain,
          chain: registry?.chain,
          availableWallets: [wallets.keplr],
          wallet: wallets.keplr,
          walletAddress: sourceAddress,
          onChangeWallet,
          onChangeSelectedAsset: setSelectedAssetAddress,
          amount,
          onChangeAmount: setAmount,
        }}
        destination={{
          chain: namadaChain as Chain,
          availableWallets: [wallets.namada],
          wallet: wallets.namada,
          walletAddress: namadaAddress,
          isShielded: shielded,
          onChangeShielded: setShielded,
        }}
        gasConfig={gasConfig}
        isSubmitting={transferStatus === "pending"}
        isIbcTransfer={true}
        requiresIbcChannels={requiresIbcChannels}
        ibcOptions={{
          sourceChannel,
          onChangeSourceChannel: setSourceChannel,
          destinationChannel,
          onChangeDestinationChannel: setDestinationChannel,
        }}
        errorMessage={generalErrorMessage}
        onSubmitTransfer={onSubmitTransfer}
      />
    </div>
  );
};
