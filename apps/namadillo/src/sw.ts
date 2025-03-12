/// <reference lib="webworker" />
// need to export default null to satisfy typescript
export default null;
declare let self: ServiceWorkerGlobalScope;

self.addEventListener("install", () => {
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
  self.dispatchEvent(new Event("activated"));
});

const fetchWithCacheFirst = async (
  request: Request,
  cacheKey: string,
  epoch: string,
  chainId: string
): Promise<Response> => {
  if (chainId && epoch) {
    const cacheName = `RPC_FETCH_CACHE_chain_id:${chainId}_masp_epoch:${epoch}`;
    const cache = await caches.open(cacheName);

    const cachedResponse = await cache.match(cacheKey);

    if (cachedResponse) {
      return cachedResponse;
    }

    const response = await fetch(request);

    if (response.ok) {
      cache.put(cacheKey, response.clone());
    }

    return response;
  }

  return await fetch(request);
};

self.addEventListener("fetch", function (e) {
  const req = e.request.clone();

  const res = (async () => {
    if (req.method === "POST") {
      const payload = await req.json();
      const path = payload?.params?.path;

      if (
        path &&
        (path.includes("/shell/conv") ||
          path.includes("/vp/token/denomination"))
      ) {
        const response = await fetchWithCacheFirst(
          e.request,
          payload.params.path,
          maspEpoch,
          chainId
        );

        return response;
      }
    }

    return fetch(e.request);
  })();

  e.respondWith(res);
});

let chainId: string;
let maspEpoch: string;

self.onmessage = (event) => {
  if (event.data.type === "CACHE_NAME") {
    chainId = event.data.chainId;
    maspEpoch = event.data.maspEpoch;
  }
};
