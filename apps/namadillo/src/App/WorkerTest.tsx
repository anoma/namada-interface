import * as Comlink from "comlink";

import { ShieldingTransferMsgValue } from "@namada/types";
import { defaultAccountAtom } from "atoms/accounts";
import { chainAtom, nativeTokenAddressAtom } from "atoms/chain";
import { indexerUrlAtom, rpcUrlAtom } from "atoms/settings";
import BigNumber from "bignumber.js";
import { useAtomValue } from "jotai";
import { signTx } from "lib/query";
import { Shield } from "workers/ShieldMessages";
import {
  registerTransferHandlers,
  Worker as ShieldWorkerApi,
} from "workers/ShieldWorker";
import ShieldWorker from "workers/ShieldWorker?worker";
import { Worker as ShieldedSyncWorkerApi } from "workers/ShieldedSyncWorker";
import ShieldedSyncWorker from "workers/ShieldedSyncWorker?worker";

export function WorkerTest(): JSX.Element {
  const rpcUrl = useAtomValue(rpcUrlAtom);

  const { data: account } = useAtomValue(defaultAccountAtom);
  const { data: chain } = useAtomValue(chainAtom);
  const { data: token } = useAtomValue(nativeTokenAddressAtom);
  const indexerUrl = useAtomValue(indexerUrlAtom);

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
        vks: [vk],
      },
    });

    worker.terminate();
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).buildShieldlingTx = async (
    target: string,
    amount: number
  ) => {
    registerTransferHandlers();
    const worker = new ShieldWorker();
    const shieldWorker = Comlink.wrap<ShieldWorkerApi>(worker);

    await shieldWorker.init({
      type: "init",
      payload: {
        rpcUrl,
        token: token!,
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

    const msg: Shield = {
      type: "shield",
      payload: {
        account: account!,
        gasConfig: {
          gasLimit: BigNumber(250000),
          gasPrice: BigNumber(0.000001),
        },
        shieldingProps: [shieldingMsgValue],
        indexerUrl,
        chain: chain!,
      },
    };

    const { payload: encodedTx } = await shieldWorker.shield(msg);

    const signedTxs = await signTx(encodedTx, account?.address || "");

    await shieldWorker.broadcast({
      type: "broadcast",
      payload: {
        encodedTx,
        signedTxs,
      },
    });

    worker.terminate();
  };

  return <div></div>;
}
