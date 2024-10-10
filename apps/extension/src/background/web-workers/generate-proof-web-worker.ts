import { fromBase64 } from "@cosmjs/encoding";
import { deserialize, serialize } from "@dao-xyz/borsh";
import { getSdk } from "@heliax/namada-sdk/web";
import { initMulticore } from "@heliax/namada-sdk/web-init";
import { TxMsgValue } from "@namada/types";
import {
  GENERATE_PROOF_FAILED_MSG,
  GENERATE_PROOF_SUCCESSFUL_MSG,
  GenerateProofMessageData,
  INIT_MSG,
  WEB_WORKER_ERROR_MSG,
} from "./types";

(async function init() {
  const { cryptoMemory } = await initMulticore();

  addEventListener(
    "message",
    async ({ data }: { data: GenerateProofMessageData }) => {
      try {
        const { spendingKey, nativeToken } = data;
        let txMsg = fromBase64(data.txMsg);

        const { masp } = getSdk(cryptoMemory, "", "", "", nativeToken);
        await masp.loadMaspParams("");
        await masp.addSpendingKey(spendingKey, "alias");

        const deserializedTxMsg = deserialize(Buffer.from(txMsg), TxMsgValue);
        txMsg = serialize(deserializedTxMsg);

        // TODO: Do Proof-Generating stuff
        postMessage({ msgName: GENERATE_PROOF_SUCCESSFUL_MSG });
      } catch (error) {
        console.error(error);
        postMessage({
          msgName: GENERATE_PROOF_FAILED_MSG,
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
