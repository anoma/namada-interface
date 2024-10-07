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
import { EncodedTxData, signTx } from "lib/query";
import PromiseWorker from "promise-worker";
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

  const shieldWorker = new PromiseWorker(new ShieldWorker());
  const { data: account } = useAtomValue(defaultAccountAtom);
  const { data: chain } = useAtomValue(chainAtom);
  const { data: token } = useAtomValue(nativeTokenAddressAtom);
  const indexerUrl = useAtomValue(indexerUrlAtom);
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
  (window as any).buildShieldlingTx = async () => {
    await shieldWorker.postMessage({
      type: "init",
      payload: {
        rpcUrl,
        token: token!,
      },
    });

    const msg: ShieldMessageType = {
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

    const encodedTx =
      await shieldWorker.postMessage<
        Promise<EncodedTxData<ShieldingTransferMsgValue>>
      >(msg);

    const signedTxs = await signTx("namada", encodedTx, account?.address || "");

    await shieldWorker.postMessage({
      type: "broadcast",
      payload: {
        sdkInit: {
          rpcUrl,
          token: token!,
        },
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
