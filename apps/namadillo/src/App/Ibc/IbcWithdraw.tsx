import { Key as KeplrKey, Window as KeplrWindow } from "@keplr-wallet/types";
import { Panel } from "@namada/components";
import { WindowWithNamada } from "@namada/types";
import BigNumber from "bignumber.js";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";

import { Chain } from "@chain-registry/types";
import { NamCurrency } from "App/Common/NamCurrency";
import { NamInput } from "App/Common/NamInput";
import { TransferModule } from "App/Transfer/TransferModule";
import { accountBalanceAtom, defaultAccountAtom } from "atoms/accounts";
import { chainAtom, chainParametersAtom } from "atoms/chain";
import { getFirstError } from "atoms/utils";
import { wallets } from "integrations";
import namadaChainRegistry from "registry/namada.json";
import { WalletProvider } from "types";
import { getSdkInstance } from "utils/sdk";
import { IbcTopHeader } from "./IbcTopHeader";

const keplr = (window as KeplrWindow).keplr!;
const namada = (window as WindowWithNamada).namada!;

const keplrChain = "theta-testnet-001";

const buttonStyles = "bg-white my-2 p-2 block";

export const IbcWithdraw: React.FC = () => {
  const [error, setError] = useState("");
  const [keplrAccount, setKeplrAccount] = useState<KeplrKey>();
  const [amount, setAmount] = useState<BigNumber>();
  const [channel, setChannel] = useState("");
  const [shielded, setShielded] = useState<boolean>(true);
  const namadaAccount = useAtomValue(defaultAccountAtom);
  const balance = useAtomValue(accountBalanceAtom);
  const namadaChainParams = useAtomValue(chainParametersAtom);
  const namadaChain = useAtomValue(chainAtom);

  useEffect(() => {
    const error = getFirstError(namadaAccount, balance, namadaChainParams);
    setError(error ? error.message : "");
  }, [
    namadaAccount.isError,
    balance.isError,
    namadaChain.isError,
    namadaChainParams.isError,
  ]);

  const withErrorReporting =
    (fn: () => Promise<void>): (() => Promise<void>) =>
    async () => {
      try {
        await fn();
        setError("");
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e);
        setError(e instanceof Error ? e.message : "unknown error");
      }
    };

  const getKeplrAccount = withErrorReporting(async () => {
    const key = await keplr.getKey(keplrChain);
    setKeplrAccount(key);
  });

  const onChangeWallet = (wallet: WalletProvider): void => {};

  const submitIbcTransfer = withErrorReporting(async () => {
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
      receiver: keplrAccount!.bech32Address,
      token: namadaChain.data!.nativeTokenAddress,
      amount: amount!,
      portId: "transfer",
      channelId: channel,
      timeoutHeight: undefined,
      timeoutSecOffset: undefined,
      shieldingData: undefined,
    });

    const signedTxBytes = await namada.sign({
      signer: namadaAccount.data!.address,
      txs: [tx],
      checksums: namadaChainParams.data!.checksums,
    });

    await sdk.rpc.broadcastTx(signedTxBytes![0], wrapperTxProps);
  });

  return (
    <>
      <header className="flex flex-col items-center text-center mb-3 gap-6">
        <IbcTopHeader type="namToIbc" isShielded={shielded} />
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
          isShielded: shielded,
        }}
        destination={{
          wallet: wallets.keplr,
          availableWallets: [wallets.keplr!],
          isShielded: shielded,
          enableCustomAddress: true,
          onChangeWallet,
        }}
        onSubmitTransfer={() => {}}
      />

      <Panel
        title="IBC Namada -> Cosmos"
        className="mb-2 bg-[#999999] text-black"
      >
        {/* Error */}
        <p className="text-[#ff0000]">{error}</p>
        <hr />
        {/* Namada account */}
        <h3>Namada account</h3>
        {namadaAccount.isSuccess &&
          typeof namadaAccount.data !== "undefined" && (
            <p>
              {namadaAccount.data.alias} {namadaAccount.data.address}
            </p>
          )}

        <hr />

        {/* Balance */}
        <h3>Balance</h3>
        {balance.isSuccess && <NamCurrency amount={balance.data} />}

        <hr />

        {/* Keplr address */}
        <h3>Keplr address</h3>
        <button className={buttonStyles} onClick={getKeplrAccount}>
          get address
        </button>

        {keplrAccount && (
          <p>
            {keplrAccount.name} {keplrAccount.bech32Address}
          </p>
        )}

        <hr />

        {/* Amount */}
        <h3>Amount to send</h3>
        <NamInput value={amount} onChange={(e) => setAmount(e.target.value)} />

        <hr />

        {/* Channel */}
        <h3>Channel</h3>
        <input
          type="text"
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
        />

        <hr />

        {/* Submit IBC transfer */}
        <h3>Submit IBC transfer</h3>
        <button className={buttonStyles} onClick={submitIbcTransfer}>
          submit IBC transfer
        </button>
      </Panel>
    </>
  );
};
