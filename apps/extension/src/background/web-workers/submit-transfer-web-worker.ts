import { defaultChainId, chains } from "@namada/chains";
import { Sdk } from "@namada/shared";
import { init as initShared } from "@namada/shared/src/init";
import { fromBase64 } from "@cosmjs/encoding";
import {
  INIT_MSG,
  SubmitTransferMessageData,
  TRANSFER_FAILED_MSG,
  TRANSFER_SUCCESSFUL_MSG,
  WEB_WORKER_ERROR_MSG,
} from "./types";

(async function init() {
  await initShared();
  const sdk = new Sdk(chains[defaultChainId].rpc);
  await sdk.load_masp_params();

  addEventListener(
    "message",
    async ({ data }: { data: SubmitTransferMessageData }) => {
      try {
        const txMsg = fromBase64(data.txMsg);
        const { pk, xsk } = data.signingKey;

        //TODO: make pk mandatory and rename to secretKey
        await sdk.reveal_pk(pk as string, txMsg);

        const builtTx = await sdk.build_transfer(
          fromBase64(data.transferMsg),
          txMsg,
          xsk
        );
        const txBytes = await sdk.sign_tx(
          builtTx,
          pk as string
        );
        await sdk.process_tx(txBytes, txMsg);

        postMessage({ msgName: TRANSFER_SUCCESSFUL_MSG });
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
