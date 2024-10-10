import {
  GENERATE_PROOF_FAILED_MSG,
  GENERATE_PROOF_SUCCESSFUL_MSG,
  GenerateProofMessageData,
  INIT_MSG,
  Msg,
  WEB_WORKER_ERROR_MSG,
} from "./types";

export const init = (
  data: GenerateProofMessageData,
  proofGenerateCompletedHandler: (
    msgId: string,
    success: boolean,
    payload?: string
  ) => Promise<void>,
  sendResponse?: (response?: unknown) => void
): void => {
  const w = new Worker("generate-proof-web-worker.namada.js");

  w.onmessage = (e: MessageEvent<Msg>) => {
    const { msgName, payload } = e.data;
    if (msgName === INIT_MSG) {
      w.postMessage(data);
    } else if (msgName === GENERATE_PROOF_SUCCESSFUL_MSG) {
      proofGenerateCompletedHandler(data.msgId, true, payload)
        .then(() => w.terminate())
        .catch((e) => console.error(e));
    } else if (msgName === GENERATE_PROOF_FAILED_MSG) {
      proofGenerateCompletedHandler(data.msgId, false, payload)
        .then(() => w.terminate())
        .catch((e) => console.error(e));
    } else if (msgName === WEB_WORKER_ERROR_MSG) {
      sendResponse?.({ error: payload });
    } else {
      console.warn("Not supported msg type.");
    }
  };
};
