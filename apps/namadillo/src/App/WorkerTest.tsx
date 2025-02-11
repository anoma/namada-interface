import * as Comlink from "comlink";

import {
  AccountType,
  ShieldedTransferMsgValue,
  ShieldingTransferMsgValue,
  UnshieldingTransferMsgValue,
} from "@namada/types";
import {
  accountsAtom,
  defaultAccountAtom,
  disposableSignerAtom,
} from "atoms/accounts";
import { chainAtom, nativeTokenAddressAtom } from "atoms/chain";
import { maspIndexerUrlAtom, rpcUrlAtom } from "atoms/settings";
import BigNumber from "bignumber.js";
import { useAtom, useAtomValue } from "jotai";
import { isPublicKeyRevealed, signTx } from "lib/query";
import { Shield, ShieldedTransfer, Unshield } from "workers/MaspTxMessages";
import {
  Worker as MaspTxWorkerApi,
  registerTransferHandlers,
} from "workers/MaspTxWorker";
import MaspTxWorker from "workers/MaspTxWorker?worker";
import { Worker as ShieldedSyncWorkerApi } from "workers/ShieldedSyncWorker";
import ShieldedSyncWorker from "workers/ShieldedSyncWorker?worker";

export function WorkerTest(): JSX.Element {
  const rpcUrl = useAtomValue(rpcUrlAtom);

  const { data: account } = useAtomValue(defaultAccountAtom);
  const [{ refetch }] = useAtom(disposableSignerAtom);
  const { data: accounts } = useAtomValue(accountsAtom);
  const { data: chain } = useAtomValue(chainAtom);
  const { data: token } = useAtomValue(nativeTokenAddressAtom);
  const maspIndexerUrl = useAtomValue(maspIndexerUrlAtom);
  const shieldedAccount = accounts?.find(
    (a) => a.type === AccountType.ShieldedKeys && a.alias === account?.alias
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).shieldedSync = async (vk: string) => {
    const worker = new ShieldedSyncWorker();
    const shieldedSyncWorker = Comlink.wrap<ShieldedSyncWorkerApi>(worker);
    await shieldedSyncWorker.init({
      type: "init",
      payload: {
        rpcUrl,
        token: token!,
      },
    });

    await shieldedSyncWorker.sync({
      type: "sync",
      payload: {
        vks: [{ key: vk, birthday: 0 }],
        chainId: chain!.id,
      },
    });

    worker.terminate();
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).shield = async (target: string, amount: number) => {
    registerTransferHandlers();
    const worker = new MaspTxWorker();
    const shieldWorker = Comlink.wrap<MaspTxWorkerApi>(worker);

    await shieldWorker.init({
      type: "init",
      payload: {
        rpcUrl,
        token: token!,
        maspIndexerUrl,
      },
    });

    const shieldingMsgValue = new ShieldingTransferMsgValue({
      target,
      data: [
        {
          source: account?.address || "",
          token: token!,
          amount: BigNumber(amount),
        },
      ],
    });

    const publicKeyRevealed = await isPublicKeyRevealed(account!.address);
    const msg: Shield = {
      type: "shield",
      payload: {
        publicKeyRevealed,
        account: account!,
        gasConfig: {
          gasLimit: BigNumber(50000),
          gasPriceInMinDenom: BigNumber(0),
          gasToken: "tnam1",
        },
        props: [shieldingMsgValue],
        chain: chain!,
      },
    };

    const { payload: encodedTx } = await shieldWorker.shield(msg);

    const signedTxs = await signTx(encodedTx, account?.address || "");

    await shieldWorker.broadcast({
      type: "broadcast",
      payload: {
        encodedTxData: encodedTx,
        signedTxs,
      },
    });

    worker.terminate();
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).unshield = async (target: string, amount: number) => {
    registerTransferHandlers();
    const worker = new MaspTxWorker();
    const shieldWorker = Comlink.wrap<MaspTxWorkerApi>(worker);

    await shieldWorker.init({
      type: "init",
      payload: {
        rpcUrl,
        token: token!,
        maspIndexerUrl,
      },
    });

    const shieldingMsgValue = new UnshieldingTransferMsgValue({
      source: shieldedAccount!.pseudoExtendedKey!,
      gasSpendingKey: shieldedAccount!.pseudoExtendedKey!,
      data: [
        {
          target,
          token: token!,
          amount: BigNumber(amount),
        },
      ],
    });

    const disposableSigner = (await refetch()).data;

    const msg: Unshield = {
      type: "unshield",
      payload: {
        account: {
          ...account!,
          publicKey: disposableSigner!.publicKey,
        },
        gasConfig: {
          gasLimit: BigNumber(100000),
          gasPriceInMinDenom: BigNumber(0),
          gasToken: "tnam1",
        },
        props: [shieldingMsgValue],
        chain: chain!,
      },
    };

    const { payload: encodedTx } = await shieldWorker.unshield(msg);
    const signedTxs = await signTx(encodedTx, disposableSigner?.address || "");

    await shieldWorker.broadcast({
      type: "broadcast",
      payload: {
        encodedTxData: encodedTx,
        signedTxs,
      },
    });

    worker.terminate();
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).shielded = async (target: string, amount: number) => {
    registerTransferHandlers();
    const worker = new MaspTxWorker();
    const shieldWorker = Comlink.wrap<MaspTxWorkerApi>(worker);

    await shieldWorker.init({
      type: "init",
      payload: {
        rpcUrl,
        token: token!,
        maspIndexerUrl,
      },
    });

    const shieldingMsgValue = new ShieldedTransferMsgValue({
      gasSpendingKey: shieldedAccount!.pseudoExtendedKey!,
      data: [
        {
          source: shieldedAccount!.pseudoExtendedKey!,
          target,
          token: token!,
          amount: BigNumber(amount),
        },
      ],
    });

    const disposableSigner = (await refetch()).data;

    const msg: ShieldedTransfer = {
      type: "shielded-transfer",
      payload: {
        account: {
          ...account!,
          publicKey: disposableSigner!.publicKey,
        },
        gasConfig: {
          gasLimit: BigNumber(50000),
          gasPriceInMinDenom: BigNumber(0),
          gasToken: "tnam1",
        },
        props: [shieldingMsgValue],
        chain: chain!,
      },
    };

    const { payload: encodedTx } = await shieldWorker.shieldedTransfer(msg);
    const signedTxs = await signTx(encodedTx, disposableSigner?.address || "");

    await shieldWorker.broadcast({
      type: "broadcast",
      payload: {
        encodedTxData: encodedTx,
        signedTxs,
      },
    });

    worker.terminate();
  };

  return <div></div>;
}
