/// <reference lib="webworker" />
// need to export default null to satisfy typescript
export default null;
declare let self: ServiceWorkerGlobalScope;

let chainId: string;
let maspEpoch: string;

self.addEventListener("install", () => {
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

const deleteCache = async (key: string): Promise<void> => {
  await caches.delete(key);
};

const getCacheName = (chainId: string, maspEpoch: string): string =>
  `RPC_FETCH_CACHE_chain_id:${chainId}_masp_epoch:${maspEpoch}`;

const deleteOldCaches = async (): Promise<void> => {
  if (chainId && maspEpoch) {
    const cacheName = getCacheName(chainId, maspEpoch);

    const keyList = await caches.keys();
    const cachesToDelete = keyList.filter((key) => key !== cacheName);

    await Promise.all(cachesToDelete.map(deleteCache));
  }
};

const fetchWithCacheFirst = async (
  request: Request,
  cacheKey: string,
  epoch: string,
  chainId: string
): Promise<Response> => {
  if (chainId && epoch) {
    const cacheName = getCacheName(chainId, epoch);
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

self.onmessage = async (event) => {
  if (event.data.type === "CACHE_NAME") {
    chainId = event.data.chainId;
    maspEpoch = event.data.maspEpoch;

    event.waitUntil(deleteOldCaches());
  }
};
