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

export const createOffscreenWithTxWorker = async (
  offscreenDocumentPath: string
): Promise<void> => {
  await chrome.offscreen.createDocument({
    url: chrome.runtime.getURL(offscreenDocumentPath),
    //TODO: change to WORKER with new version of chrome typings
    reasons: [chrome.offscreen.Reason.IFRAME_SCRIPTING],
    justification:
      "We need to spawn WebWorkers to submit transfers in non-blocking way.",
  });
};

export const SUBMIT_TRANSFER_MSG_TYPE = "submit-transfer-offscreen";
export const OFFSCREEN_TARGET = "offscreen.namada";
