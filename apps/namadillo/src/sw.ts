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

let fetchCacheKey = "";
let epoch = 0;

const fetchWithCacheFirst = async (
  request: Request,
  cacheKey: string
): Promise<Response> => {
  const cacheName = `RPC_FETCH_CACHE_${fetchCacheKey}_${epoch}`;
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
          payload.params.path
        );

        return response;
      }
    }

    return fetch(e.request);
  })();

  e.respondWith(res);
});

self.onmessage = (event) => {
  if (event.data.type === "CHAIN_CHANGE") {
    fetchCacheKey = event.data.chainId;
    epoch = event.data.epoch;
  }
};
