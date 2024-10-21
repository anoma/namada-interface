import { Chain } from "@chain-registry/types";
import { Panel } from "@namada/components";
import { WindowWithNamada } from "@namada/types";
import { mapUndefined } from "@namada/utils";
import { TransferModule } from "App/Transfer/TransferModule";
import { defaultAccountAtom } from "atoms/accounts";
import { chainAtom, chainParametersAtom } from "atoms/chain";
import { knownChainsAtom } from "atoms/integrations";
import BigNumber from "bignumber.js";
import { useWalletManager } from "hooks/useWalletManager";
import { wallets } from "integrations";
import { KeplrWalletManager } from "integrations/Keplr";
import { useAtomValue } from "jotai";
import { useMemo, useState } from "react";
import namadaChainRegistry from "registry/namada.json";
import { getSdkInstance } from "utils/sdk";
import { IbcTopHeader } from "./IbcTopHeader";

const defaultChainId = "cosmoshub-4";
const keplr = new KeplrWalletManager();
const namada = (window as WindowWithNamada).namada!;

export const IbcWithdraw: React.FC = () => {
  const [channel, setChannel] = useState("");
  const namadaAccount = useAtomValue(defaultAccountAtom);
  const knownChains = useAtomValue(knownChainsAtom);
  const namadaChainParams = useAtomValue(chainParametersAtom);
  const namadaChain = useAtomValue(chainAtom);

  const {
    walletAddress: keplrAddress,
    connectToChainId,
    chainId,
  } = useWalletManager(keplr);

  const onChangeWallet = (): void => {
    connectToChainId(chainId || defaultChainId);
  };

  const submitIbcTransfer = async (
    amount: BigNumber,
    destinationAddress: string,
    memo: string = ""
  ): Promise<void> => {
    const wrapperTxProps = {
      token: namadaChain.data!.nativeTokenAddress,
      feeAmount: BigNumber(0),
      gasLimit: BigNumber(1_000_000),
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
      channelId: channel,
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

  const availableChains = useMemo(
    () => Object.values(knownChains || {}).map((entry) => entry.chain),
    [knownChains]
  );

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
        }}
        destination={{
          wallet: wallets.keplr,
          walletAddress: keplrAddress,
          availableWallets: [wallets.keplr!],
          availableChains,
          enableCustomAddress: true,
          chain: mapUndefined((id) => knownChains[id].chain, chainId),
          onChangeWallet,
          onChangeChain,
          isShielded: false,
        }}
        onSubmitTransfer={submitIbcTransfer}
      />
      <Panel
        title="IBC Namada -> Cosmos"
        className="mb-2 bg-[#999999] text-black"
      >
        {/* Channel */}
        <h3>Channel</h3>
        <input
          type="text"
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
        />
      </Panel>
    </>
  );
};
