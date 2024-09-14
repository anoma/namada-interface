importScripts("indexedDb.js");
importScripts("constants.js");
// const { NAMADA_INTERFACE_PROXY: isProxy = false } = process.env;

const isProxy = true;
const TRUSTED_SETUP_URL =
  isProxy ?
    "http://localhost:8010/proxy"
    : "https://github.com/anoma/masp-mpc/releases/download/namada-trusted-setup";

const store = new IndexedDBKVStore(STORAGE_PREFIX);

const resetMaspParamStore = async (): Promise<void> => {
  store.set(MaspParam.Output, null);
  store.set(MaspParam.Spend, null);
  store.set(MaspParam.Convert, null);
};

// resetMaspParamStore();

const sha256Hash = async (msg: Uint8Array): Promise<string> => {
  const hashBuffer = await crypto.subtle.digest("SHA-256", msg);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  // Return hash as hex
  return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
};

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
      const { length, sha256sum } = MASP_PARAM_LEN[maspParam];

      // Reject if invalid length (incomplete download or invalid)
      console.log("Validating data length...");

      if (length !== data.length) {
        return Promise.reject(
          `Invalid data length! Expected ${length}, received ${data.length}!`
        );
      }

      // Reject if invalid hash (otherwise invalid data)
      console.log("Validating sha256sum...");
      const hash = await sha256Hash(data);

      if (hash !== sha256sum) {
        return Promise.reject(
          `Invalid sha256sum! Expected ${sha256sum}, received ${hash}!`
        );
      }

      console.info(`Storing ${maspParam} => `, data);
      await store.set(maspParam, data);
      console.info(`Successfully stored ${maspParam}`);
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
