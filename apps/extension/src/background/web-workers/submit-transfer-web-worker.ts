import { getSdk } from "@namada/sdk/web";
import { initMulticore } from "@namada/sdk/web-init";
import { AccountType } from "@namada/types";
import {
  INIT_MSG,
  SubmitTransferMessageData,
  TRANSFER_FAILED_MSG,
  TRANSFER_SUCCESSFUL_MSG,
  WEB_WORKER_ERROR_MSG,
} from "./types";

(async function init() {
  const { cryptoMemory } = await initMulticore();
  addEventListener(
    "message",
    async ({ data }: { data: SubmitTransferMessageData }) => {
      try {
        const { signingKey, rpc, nativeToken } = data;
        const { txMsg, transferMsg } = data;

        const sdk = getSdk(cryptoMemory, rpc, "NOT USED DB NAME", nativeToken);
        await sdk.masp.loadMaspParams("TODO: not used for time being");
        // For transparent transactions we have to reveal the public key.
        if (signingKey.type !== AccountType.ShieldedKeys) {
          await sdk.tx.revealPk(signingKey.value, txMsg);
        }
        const builtTx = await sdk.tx.buildTransfer(txMsg, transferMsg);
        const signedTx = await sdk.tx.signTx(builtTx, signingKey.value);
        const innerTxHash = await sdk.rpc.broadcastTx(signedTx);

        postMessage({
          msgName: TRANSFER_SUCCESSFUL_MSG,
          payload: innerTxHash,
        });
      } catch (error) {
        console.error(error);
        postMessage({
          msgName: TRANSFER_FAILED_MSG,
          payload: error instanceof Error ? error.message : error,
        });
      }
    },
    false
  );

  postMessage({ msgName: INIT_MSG });
})().catch((error) => {
  const { message, stack } = error;
  postMessage({
    msgName: WEB_WORKER_ERROR_MSG,
    payload: { message, stack },
  });
});
