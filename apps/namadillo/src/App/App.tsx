import { ShieldingTransferMsgValue } from "@namada/types";
import { Toasts } from "App/Common/Toast";
import { AppLayout } from "App/Layout/AppLayout";
import { defaultAccountAtom } from "atoms/accounts";
import { chainAtom, nativeTokenAddressAtom } from "atoms/chain";
import { rpcUrlAtom } from "atoms/settings";
import BigNumber from "bignumber.js";
import { createBrowserHistory } from "history";
import { useSdk } from "hooks";
import { useExtensionEvents } from "hooks/useExtensionEvents";
import { useTransactionCallback } from "hooks/useTransactionCallbacks";
import { useTransactionNotifications } from "hooks/useTransactionNotifications";
import { useAtomValue } from "jotai";
import { broadcastTx, EncodedTxData, signTx } from "lib/query";
import { Outlet } from "react-router-dom";
import { ShieldMessageType } from "workers/ShieldWorker";
import ShieldWorker from "workers/ShieldWorker?worker";
import { ChainLoader } from "./Setup/ChainLoader";

export const history = createBrowserHistory({ window });

export function App(): JSX.Element {
  useExtensionEvents();
  useTransactionNotifications();
  useTransactionCallback();

  const rpcUrl = useAtomValue(rpcUrlAtom);

  // const worker = new ShieldedSyncWorker();
  // const maspIndexerUrl = useAtomValue(maspIndexerUrlAtom);

  // // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // (window as any).shieldedSync = () => {
  //   console.log("maspIndexerUrl", maspIndexerUrl);
  //   const msg: ShieldedSyncMessageType = {
  //     type: "shielded-sync-multicore",
  //     payload: {
  //       rpcUrl,
  //       maspIndexerUrl,
  //       vks: [
  //         "zvknam1qvgwgy79qqqqpq88yru6n3f3ugfme002t7272a0ke8zdr2kt80jhnjwmgxkwm7yc6ydp8tfh8lmd28n8hrmcvqszjm3tnytryaf4qhwu645xks4nnx64m3fnpm8yr6hrpd8jtsupyzz4knqleuy7jdjz32jcz9ual56vrf3estg0e6kew0g9aqs4vg2d6n569c78ttqw4zw6mvjkhwfprcc804qt3yewsrxf8l67p87ltnqjtjkr35pfnnxavs9c5wqpr2t2lf3husqn4zvux",
  //       ],
  //     },
  //   };

  //   worker.postMessage(msg);
  // };
  //
  //
  const { sdk } = useSdk();

  const shieldWorker = new ShieldWorker();
  const { data: account } = useAtomValue(defaultAccountAtom);
  const { data: chain } = useAtomValue(chainAtom);
  const { data: token } = useAtomValue(nativeTokenAddressAtom);
  const shiedlingMsgValue = {
    target:
      "znam1vue386rsee5c65qsvlm9tgj5lqetz6ejkln3j57utc44w2n8upty57z7lh07myrj3clfxyl9lvn",
    data: [
      {
        source: account?.address || "",
        token: token!,
        amount: 100 as unknown as BigNumber,
      },
    ],
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).buildShieldlingTx = () => {
    const msg: ShieldMessageType = {
      type: "shield",
      payload: {
        account: account!,
        gasConfig: {
          gasLimit: 250000,
          gasPrice: 0.000001,
        },
        shieldingProps: [shiedlingMsgValue],
        rpcUrl,
        token: token!,
        chain: chain!,
      },
    };

    shieldWorker.postMessage(msg);
  };

  shieldWorker.onmessage = async (e) => {
    const encodedTx = e.data
      .payload as EncodedTxData<ShieldingTransferMsgValue>;
    console.log("encodedTx2", encodedTx);
    const signedTxs = await signTx("namada", encodedTx, account?.address || "");
    console.log("signedTx", signedTxs);

    signedTxs.forEach((tx) => {
      signedTxs.forEach((signedTx) => {
        broadcastTx(
          encodedTx,
          signedTx,
          encodedTx.meta?.props
          // TODO: event type
        );
      });
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
