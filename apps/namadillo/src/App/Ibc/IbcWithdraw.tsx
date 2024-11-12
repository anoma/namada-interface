import { Chain } from "@chain-registry/types";
import { mapUndefined } from "@namada/utils";
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
} from "atoms/integrations";
import { useWalletManager } from "hooks/useWalletManager";
import { wallets } from "integrations";
import { KeplrWalletManager } from "integrations/Keplr";
import { useAtomValue } from "jotai";
import { broadcastTx } from "lib/query";
import { useEffect, useState } from "react";
import namadaChainRegistry from "registry/namada.json";
import { namadaAsset } from "registry/namadaAsset";
import { Address } from "types";
import { IbcTopHeader } from "./IbcTopHeader";

const defaultChainId = "cosmoshub-4";
const keplr = new KeplrWalletManager();

export const IbcWithdraw: React.FC = () => {
  const namadaAccount = useAtomValue(defaultAccountAtom);
  const chainRegistry = useAtomValue(chainRegistryAtom);
  const availableChains = useAtomValue(availableChainsAtom);

  const [selectedAssetAddress, setSelectedAssetAddress] = useState<Address>();

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
  } = useWalletManager(keplr);

  const onChangeWallet = (): void => {
    connectToChainId(chainId || defaultChainId);
  };

  const {
    mutate: createIbcTx,
    isSuccess,
    isError,
    error: ibcTxError,
    data: ibcTxData,
  } = useAtomValue(createIbcTxAtom);

  // TODO: properly notify the user on error
  useEffect(() => {
    if (isError) {
      console.error(ibcTxError);
    }
  }, [isError]);

  useEffect(() => {
    if (isSuccess) {
      const { encodedTxData, signedTxs } = ibcTxData;
      signedTxs.forEach((signedTx) =>
        broadcastTx(
          encodedTxData,
          signedTx,
          encodedTxData.meta?.props,
          "IbcTransfer"
        )
      );
    }
  }, [isSuccess]);

  const submitIbcTransfer = async ({
    amount,
    destinationAddress,
    ibcOptions,
    memo,
  }: OnSubmitTransferParams): Promise<void> => {
    const selectedAsset = mapUndefined(
      (address) => availableAssets?.[address],
      selectedAssetAddress
    );

    if (typeof selectedAsset === "undefined") {
      throw new Error("No selected asset");
    }

    const channelId = ibcOptions?.sourceChannel;
    if (typeof channelId === "undefined") {
      throw new Error("No channel ID is set");
    }

    if (typeof gasConfig === "undefined") {
      throw new Error("No gas config");
    }

    createIbcTx({
      destinationAddress,
      token: selectedAsset,
      amount,
      portId: "transfer",
      channelId,
      gasConfig,
      memo,
    });
  };

  const onChangeChain = (chain: Chain): void => {
    connectToChainId(chain.chain_id);
  };

  return (
    <>
      <header className="flex flex-col items-center text-center mb-3 gap-6">
        <IbcTopHeader type="namToIbc" isShielded={false} />
        <div className="max-w-[360px] mx-auto mb-3">
          <h2 className="mb-1 text-lg font-light">
            Withdraw assets from Namada via IBC
          </h2>
          <p className="text-sm font-light leading-tight">
            To withdraw shielded assets please unshield them to your transparent
            account
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
        }}
        destination={{
          wallet: wallets.keplr,
          walletAddress: keplrAddress,
          availableWallets: [wallets.keplr!],
          availableChains,
          enableCustomAddress: true,
          chain: mapUndefined((id) => chainRegistry[id].chain, chainId),
          onChangeWallet,
          onChangeChain,
          isShielded: false,
        }}
        isIbcTransfer={true}
        onSubmitTransfer={submitIbcTransfer}
        transactionFee={transactionFee}
      />
    </>
  );
};
