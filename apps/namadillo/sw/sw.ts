importScripts("indexedDb.js");
importScripts("constants.js");
// const { NAMADA_INTERFACE_PROXY: isProxy = false } = process.env;

const isProxy = true;
const TRUSTED_SETUP_URL =
  isProxy ?
    "http://localhost:8010/proxy"
    : "https://github.com/anoma/masp-mpc/releases/download/namada-trusted-setup";

const store = new IndexedDBKVStore(STORAGE_PREFIX);

const fetchAndStoreMaspParam = async (maspParam: MaspParam): Promise<void> => {
  console.info(`Fetching ${maspParam}...`);
  return fetch([TRUSTED_SETUP_URL, maspParam].join("/"))
    .then(async (response) => {
      if (response.ok) {
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No readable stream returned!");
        }
        return new ReadableStream({
          start(controller) {
            return pump();
            function pump() {
              return reader?.read().then(({ done, value }) => {
                // When no more data needs to be consumed, close the stream
                if (done) {
                  controller.close();
                  return;
                }
                // Enqueue the next data chunk into our target stream
                controller.enqueue(value);
                return pump();
              });
            }
          },
        });
      }
    })
    .then((stream) => new Response(stream))
    .then((response) => response.blob())
    .then(async (blob) => {
      const arrayBuffer = await blob.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);

      // Validate data length:
      if (data.length === MASP_PARAM_LEN[maspParam]) {
        console.info(`Storing ${maspParam} => `, data);
        return store.set(maspParam, data);
      }
      return Promise.reject(
        `Failed to download ${maspParam}: ${data.length} does not match ${MASP_PARAM_LEN[maspParam]}`
      );
    });
};

(async () => {
  const maspOutputParam = await store.get(MaspParam.Output);
  console.log("Found output?: ", maspOutputParam);

  const maspSpendParam = await store.get(MaspParam.Spend);
  console.log("Found spend?: ", maspSpendParam);

  const maspConvertParam = await store.get(MaspParam.Convert);
  console.log("Found convert?", maspConvertParam);

  if (!maspOutputParam) await fetchAndStoreMaspParam(MaspParam.Output);
  if (!maspSpendParam) await fetchAndStoreMaspParam(MaspParam.Spend);
  if (!maspConvertParam) await fetchAndStoreMaspParam(MaspParam.Convert);
})();
