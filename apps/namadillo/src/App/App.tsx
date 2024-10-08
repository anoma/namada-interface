import * as Comlink from "comlink";

import { ShieldingTransferMsgValue } from "@namada/types";
import { Toasts } from "App/Common/Toast";
import { AppLayout } from "App/Layout/AppLayout";
import { defaultAccountAtom } from "atoms/accounts";
import { chainAtom, nativeTokenAddressAtom } from "atoms/chain";
import { indexerUrlAtom, rpcUrlAtom } from "atoms/settings";
import BigNumber from "bignumber.js";
import { createBrowserHistory } from "history";
import { useExtensionEvents } from "hooks/useExtensionEvents";
import { useTransactionCallback } from "hooks/useTransactionCallbacks";
import { useTransactionNotifications } from "hooks/useTransactionNotifications";
import { useAtomValue } from "jotai";
import { signTx } from "lib/query";
import { Outlet } from "react-router-dom";
import { Shield } from "workers/ShieldMessages";
import {
  registerTransferHandlers,
  Worker as ShieldWorkerApi,
} from "workers/ShieldWorker";
import ShieldWorker from "workers/ShieldWorker?worker";
import { Worker as ShieldedSyncWorkerApi } from "workers/ShieldedSyncWorker";
import ShieldedSyncWorker from "workers/ShieldedSyncWorker?worker";

import { ChainLoader } from "./Setup/ChainLoader";

export const history = createBrowserHistory({ window });

export function App(): JSX.Element {
  useExtensionEvents();
  useTransactionNotifications();
  useTransactionCallback();

  const rpcUrl = useAtomValue(rpcUrlAtom);

  const { data: account } = useAtomValue(defaultAccountAtom);
  const { data: chain } = useAtomValue(chainAtom);
  const { data: token } = useAtomValue(nativeTokenAddressAtom);
  const indexerUrl = useAtomValue(indexerUrlAtom);

  const shieldedSyncWorker = Comlink.wrap<ShieldedSyncWorkerApi>(
    new ShieldedSyncWorker()
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).shieldedSync = async () => {
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
        vks: [
          "zvknam1qvgwgy79qqqqpq88yru6n3f3ugfme002t7272a0ke8zdr2kt80jhnjwmgxkwm7yc6ydp8tfh8lmd28n8hrmcvqszjm3tnytryaf4qhwu645xks4nnx64m3fnpm8yr6hrpd8jtsupyzz4knqleuy7jdjz32jcz9ual56vrf3estg0e6kew0g9aqs4vg2d6n569c78ttqw4zw6mvjkhwfprcc804qt3yewsrxf8l67p87ltnqjtjkr35pfnnxavs9c5wqpr2t2lf3husqn4zvux",
        ],
      },
    });
  };

  registerTransferHandlers();
  const shieldWorker = Comlink.wrap<ShieldWorkerApi>(new ShieldWorker());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).buildShieldlingTx = async () => {
    await shieldWorker.init({
      type: "init",
      payload: {
        rpcUrl,
        token: token!,
      },
    });

    const shiedlingMsgValue = new ShieldingTransferMsgValue({
      target:
        "znam1vue386rsee5c65qsvlm9tgj5lqetz6ejkln3j57utc44w2n8upty57z7lh07myrj3clfxyl9lvn",
      data: [
        {
          source: account?.address || "",
          token: token!,
          amount: BigNumber(100),
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
        shieldingProps: [shiedlingMsgValue],
        indexerUrl,
        chain: chain!,
      },
    };

    const { payload: encodedTx } = await shieldWorker.shield(msg);

    const signedTxs = await signTx("namada", encodedTx, account?.address || "");

    await shieldWorker.broadcast({
      type: "broadcast",
      payload: {
        encodedTx,
        signedTxs,
      },
    });
  };

  return (
    <>
      <Toasts />
      <AppLayout>
        <ChainLoader>
          <Outlet />
        </ChainLoader>
      </AppLayout>
    </>
  );
}
