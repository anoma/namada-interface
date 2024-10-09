declare let self: ServiceWorkerGlobalScope;

export const hasOffscreenDocument = async (path: string): Promise<boolean> => {
  const offscreenUrl = chrome.runtime.getURL(path);
  const matchedClients = await self.clients.matchAll();
  for (const client of matchedClients) {
    if (client.url === offscreenUrl) {
      return true;
    }
  }
  return false;
};

export const createOffscreenWithProofWorker = async (
  offscreenDocumentPath: string
): Promise<void> => {
  await chrome.offscreen.createDocument({
    url: chrome.runtime.getURL(offscreenDocumentPath),
    reasons: [
      chrome.offscreen.Reason.WORKERS ||
        chrome.offscreen.Reason.IFRAME_SCRIPTING,
    ],
    justification:
      "We need to spawn WebWorkers to generate ZK proofs in a non-blocking way.",
  });
};

export const GENERATE_PROOF_MSG_TYPE = "generate-proof-offscreen";
export const OFFSCREEN_TARGET = "offscreen.namada-keychain";
