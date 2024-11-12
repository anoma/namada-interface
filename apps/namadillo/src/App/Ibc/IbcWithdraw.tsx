import { Chain } from "@chain-registry/types";
import { WindowWithNamada } from "@namada/types";
import { mapUndefined } from "@namada/utils";
import {
  OnSubmitTransferParams,
  TransferModule,
} from "App/Transfer/TransferModule";
import { accountBalanceAtom, defaultAccountAtom } from "atoms/accounts";
import { chainAtom, chainParametersAtom } from "atoms/chain";
import { availableChainsAtom, chainRegistryAtom } from "atoms/integrations";
import BigNumber from "bignumber.js";
import { useWalletManager } from "hooks/useWalletManager";
import { wallets } from "integrations";
import { KeplrWalletManager } from "integrations/Keplr";
import { useAtomValue } from "jotai";
import { useState } from "react";
import namadaChainRegistry from "registry/namada.json";
import { namadaAsset } from "registry/namadaAsset";
import { Address, AddressWithAssetAndAmountMap } from "types";
import { getSdkInstance } from "utils/sdk";
import { IbcTopHeader } from "./IbcTopHeader";

const defaultChainId = "cosmoshub-4";
const keplr = new KeplrWalletManager();
const namada = (window as WindowWithNamada).namada!;

export const IbcWithdraw: React.FC = () => {
  const namadaAccount = useAtomValue(defaultAccountAtom);
  const chainRegistry = useAtomValue(chainRegistryAtom);
  const availableChains = useAtomValue(availableChainsAtom);
  const namadaChainParams = useAtomValue(chainParametersAtom);
  const namadaChain = useAtomValue(chainAtom);

  const [selectedAssetAddress, setSelectedAssetAddress] = useState<Address>();

  // TODO: remove hardcoding and display assets other than NAM
  const availableAmount = useAtomValue(accountBalanceAtom).data;
  const availableAssets: AddressWithAssetAndAmountMap =
    availableAmount ?
      {
        [namadaAsset.address]: {
          asset: namadaAsset,
          originalAddress: namadaAsset.address,
          amount: availableAmount,
        },
      }
    : {};

  const GAS_PRICE = BigNumber(0.000001); // 0.000001 NAM
  const GAS_LIMIT = BigNumber(1_000_000);
  const transactionFee = {
    originalAddress: namadaAsset.address,
    asset: namadaAsset,
    amount: GAS_PRICE.multipliedBy(GAS_LIMIT),
  };

  const {
    walletAddress: keplrAddress,
    connectToChainId,
    chainId,
  } = useWalletManager(keplr);

  const onChangeWallet = (): void => {
    connectToChainId(chainId || defaultChainId);
  };

  const submitIbcTransfer = async ({
    amount,
    destinationAddress,
    ibcOptions,
    memo,
  }: OnSubmitTransferParams): Promise<void> => {
    const wrapperTxProps = {
      token: namadaChain.data!.nativeTokenAddress,
      feeAmount: GAS_PRICE,
      gasLimit: GAS_LIMIT,
      chainId: namadaChain.data!.chainId,
      publicKey: namadaAccount.data!.publicKey,
    };
    const sdk = await getSdkInstance();
    const tx = await sdk.tx.buildIbcTransfer(wrapperTxProps, {
      source: namadaAccount.data!.address,
      receiver: destinationAddress,
      token: namadaChain.data!.nativeTokenAddress,
      amount: amount!,
      portId: "transfer",
      channelId: ibcOptions?.sourceChannel || "",
      timeoutHeight: undefined,
      timeoutSecOffset: undefined,
      shieldingData: undefined,
      memo,
    });

    const signedTxBytes = await namada.sign({
      signer: namadaAccount.data!.address,
      txs: [tx],
      checksums: namadaChainParams.data!.checksums,
    });

    await sdk.rpc.broadcastTx(signedTxBytes![0], wrapperTxProps);
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
