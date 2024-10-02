import { Toasts } from "App/Common/Toast";
import { AppLayout } from "App/Layout/AppLayout";
import { maspIndexerUrlAtom, rpcUrlAtom } from "atoms/settings";
import { createBrowserHistory } from "history";
import { useExtensionEvents } from "hooks/useExtensionEvents";
import { useOnNamadaExtensionAttached } from "hooks/useOnNamadaExtensionAttached";
import { useTransactionCallback } from "hooks/useTransactionCallbacks";
import { useTransactionNotifications } from "hooks/useTransactionNotifications";
import { useAtomValue } from "jotai";
import { Outlet } from "react-router-dom";
import { ChainLoader } from "./Setup/ChainLoader";
import { ShieldedSyncMessageType } from "./worker";
import Worker from "./worker?worker";

export const history = createBrowserHistory({ window });

export function App(): JSX.Element {
  useExtensionEvents();
  useOnNamadaExtensionAttached();
  useTransactionNotifications();
  useTransactionCallback();

  const worker = new Worker();
  const rpcUrl = useAtomValue(rpcUrlAtom);
  const maspIndexerUrl = useAtomValue(maspIndexerUrlAtom);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).shieldedSync = () => {
    const msg: ShieldedSyncMessageType = {
      type: "shielded-sync-singlecore",
      payload: {
        rpcUrl,
        maspIndexerUrl,
        vks: [
          "zvknam1qvgwgy79qqqqpq88yru6n3f3ugfme002t7272a0ke8zdr2kt80jhnjwmgxkwm7yc6ydp8tfh8lmd28n8hrmcvqszjm3tnytryaf4qhwu645xks4nnx64m3fnpm8yr6hrpd8jtsupyzz4knqleuy7jdjz32jcz9ual56vrf3estg0e6kew0g9aqs4vg2d6n569c78ttqw4zw6mvjkhwfprcc804qt3yewsrxf8l67p87ltnqjtjkr35pfnnxavs9c5wqpr2t2lf3husqn4zvux",
        ],
      },
    };

    worker.postMessage(msg);
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
