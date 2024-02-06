import { fromBase64 } from "@cosmjs/encoding";
import { deserialize, serialize } from "@dao-xyz/borsh";
import { Sdk } from "@namada/shared";
import { initMulticore as initShared } from "@namada/shared/src/init";
import { TxMsgValue } from "@namada/types";
import {
  INIT_MSG,
  SubmitTransferMessageData,
  TRANSFER_FAILED_MSG,
  TRANSFER_SUCCESSFUL_MSG,
  WEB_WORKER_ERROR_MSG,
} from "./types";

(async function init() {
  const sharedWasm = await fetch("shared.namada.wasm").then((wasm) =>
    wasm.arrayBuffer()
  );
  await initShared(sharedWasm);

  addEventListener(
    "message",
    async ({ data }: { data: SubmitTransferMessageData }) => {
      try {
        const {
          signingKey: { privateKey, xsk },
          rpc,
          nativeToken,
        } = data;
        let txMsg = fromBase64(data.txMsg);

        const sdk = new Sdk(rpc, nativeToken);
        await sdk.load_masp_params();
        // For transparent transactions we have to reveal the public key.
        if (privateKey) {
          await sdk.reveal_pk(privateKey, txMsg);
          // For transfers from masp source we unshield to pay the fee.
          // Because of that we have to pass spending key.
        } else if (xsk) {
          const deserializedTxMsg = deserialize(Buffer.from(txMsg), TxMsgValue);
          deserializedTxMsg.feeUnshield = xsk;
          txMsg = serialize(deserializedTxMsg);
        }

        const builtTx = await sdk.build_transfer(
          fromBase64(data.transferMsg),
          txMsg,
          xsk
        );
        const txBytes = await sdk.sign_tx(builtTx, txMsg, privateKey);
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
