import { Chain } from "@chain-registry/types";
import { mapUndefined } from "@namada/utils";
import { TransferTransactionTimeline } from "App/Transactions/TransferTransactionTimeline";
import {
  OnSubmitTransferParams,
  TransferModule,
} from "App/Transfer/TransferModule";
import { defaultAccountAtom } from "atoms/accounts";
import { namadaTransparentAssetsAtom } from "atoms/balance";
import { defaultGasConfigFamily } from "atoms/fees";
import {
  availableChainsAtom,
  chainRegistryAtom,
  createIbcTxAtom,
  ibcChannelsFamily,
} from "atoms/integrations";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { useWalletManager } from "hooks/useWalletManager";
import { wallets } from "integrations";
import { KeplrWalletManager } from "integrations/Keplr";
import { useAtomValue } from "jotai";
import { broadcastTx } from "lib/query";
import { useEffect, useState } from "react";
import namadaChainRegistry from "registry/namada.json";
import { Address, PartialTransferTransactionData, TransferStep } from "types";
import { namadaAsset } from "utils";
import { IbcTopHeader } from "./IbcTopHeader";

const defaultChainId = "cosmoshub-4";
const keplr = new KeplrWalletManager();

export const IbcWithdraw: React.FC = () => {
  const namadaAccount = useAtomValue(defaultAccountAtom);
  const chainRegistry = useAtomValue(chainRegistryAtom);
  const availableChains = useAtomValue(availableChainsAtom);
  const [generalErrorMessage, setGeneralErrorMessage] = useState("");
  const [selectedAssetAddress, setSelectedAssetAddress] = useState<Address>();
  const [amount, setAmount] = useState<BigNumber | undefined>();
  const [customAddress, setCustomAddress] = useState<string>("");
  const [sourceChannel, setSourceChannel] = useState("");
  const [transaction, setTransaction] =
    useState<PartialTransferTransactionData>();

  const { data: availableAssets } = useAtomValue(namadaTransparentAssetsAtom);

  const availableAmount = mapUndefined(
    (address) => availableAssets?.[address]?.amount,
    selectedAssetAddress
  );

  const { data: gasConfig } = useAtomValue(
    defaultGasConfigFamily(["IbcTransfer"])
  );

  const transactionFee = mapUndefined(
    ({ gasLimit, gasPrice }) => ({
      originalAddress: namadaAsset.address,
      asset: namadaAsset,
      amount: gasPrice.multipliedBy(gasLimit),
    }),
    gasConfig
  );

  const {
    walletAddress: keplrAddress,
    connectToChainId,
    chainId,
    registry,
  } = useWalletManager(keplr);

  const onChangeWallet = (): void => {
    connectToChainId(chainId || defaultChainId);
  };

  const { data: ibcChannels } = useAtomValue(
    ibcChannelsFamily(registry?.chain.chain_name)
  );

  useEffect(() => {
    setSourceChannel(ibcChannels?.namadaChannelId || "");
  }, [ibcChannels]);

  const {
    mutateAsync: createIbcTx,
    isError,
    error: ibcTxError,
    isPending,
  } = useAtomValue(createIbcTxAtom);

  useEffect(() => {
    if (isError) {
      setGeneralErrorMessage(ibcTxError + "");
    }
  }, [isError]);

  const submitIbcTransfer = async ({
    amount,
    destinationAddress,
    memo,
  }: OnSubmitTransferParams): Promise<void> => {
    try {
      const selectedAsset = mapUndefined(
        (address) => availableAssets?.[address],
        selectedAssetAddress
      );

      if (typeof selectedAsset === "undefined") {
        throw new Error("No selected asset");
      }

      if (typeof sourceChannel === "undefined") {
        throw new Error("No channel ID is set");
      }

      if (typeof gasConfig === "undefined") {
        throw new Error("No gas config");
      }

      const { encodedTxData, signedTxs } = await createIbcTx({
        destinationAddress,
        token: selectedAsset,
        amount,
        portId: "transfer",
        channelId: sourceChannel.trim(),
        gasConfig,
        memo,
      });

      const tx: PartialTransferTransactionData = {
        type: "TransparentToIbc",
        asset: selectedAsset.asset,
        chainId: namadaChainRegistry.chain_id,
        currentStep: TransferStep.Sign,
      };

      setTransaction(tx);
      await Promise.allSettled(
        signedTxs.map((signedTx) => {
          return broadcastTx(
            encodedTxData,
            signedTx,
            encodedTxData.meta?.props,
            "IbcTransfer"
          );
        })
      );
    } catch (err) {
      setGeneralErrorMessage(err + "");
      setTransaction(undefined);
    }
  };

  const onChangeChain = (chain: Chain): void => {
    connectToChainId(chain.chain_id);
  };

  return (
    <div className="relative min-h-[600px]">
      {!transaction && (
        <>
          <header className="flex flex-col items-center text-center mb-3 gap-6">
            <IbcTopHeader type="namToIbc" isShielded={false} />
            <div className="max-w-[360px] mx-auto mb-3">
              <h2 className="mb-1 text-lg font-light">
                Withdraw assets from Namada via IBC
              </h2>
              <p className="text-sm font-light leading-tight">
                To withdraw shielded assets please unshield them to your
                transparent account
              </p>
            </div>
          </header>
          <TransferModule
            source={{
              wallet: wallets.namada,
              walletAddress: namadaAccount.data?.address,
              chain: namadaChainRegistry as Chain,
              isShielded: false,
              availableAssets,
              availableAmount,
              selectedAssetAddress,
              onChangeSelectedAsset: setSelectedAssetAddress,
              amount,
              onChangeAmount: setAmount,
            }}
            destination={{
              wallet: wallets.keplr,
              walletAddress: keplrAddress,
              availableWallets: [wallets.keplr!],
              availableChains,
              enableCustomAddress: true,
              customAddress,
              onChangeCustomAddress: setCustomAddress,
              chain: mapUndefined((id) => chainRegistry[id]?.chain, chainId),
              onChangeWallet,
              onChangeChain,
              isShielded: false,
            }}
            isSubmitting={isPending}
            isIbcTransfer={true}
            ibcOptions={{
              sourceChannel,
              onChangeSourceChannel: setSourceChannel,
            }}
            onSubmitTransfer={submitIbcTransfer}
            transactionFee={transactionFee}
            errorMessage={generalErrorMessage}
          />
        </>
      )}
      {transaction && (
        <div
          className={clsx(
            "absolute z-50 py-12 left-0 top-0 w-full h-full bg-black"
          )}
        >
          <TransferTransactionTimeline transaction={transaction} />
        </div>
      )}
    </div>
  );
};
