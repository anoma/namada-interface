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

type MaspParamBytes = {
  param: MaspParam;
  bytes: Uint8Array;
};

const fetchMaspParam = async (
  maspParam: MaspParam,
  onRead?: (value?: Uint8Array) => void,
  onComplete?: () => void
): Promise<MaspParamBytes> => {
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
                // Invoke callback if provided
                if (onRead && value) onRead(value);
                // When no more data needs to be consumed, close the stream
                if (done) {
                  controller.close();
                  // Invoke callback if provided
                  if (onComplete) onComplete();
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
      return {
        param: maspParam,
        bytes: new Uint8Array(arrayBuffer),
      };
    });
};

const storeMaspParam = async ({
  param,
  bytes,
}: MaspParamBytes): Promise<MaspParamBytes> => {
  console.info(`Storing ${param} => `, bytes);
  await store.set(param, bytes);
  console.info(`Successfully stored ${param}`);

  return {
    param,
    bytes,
  };
};

const validateMaspParamBytes = async ({
  param,
  bytes,
}: MaspParamBytes): Promise<MaspParamBytes> => {
  const { length, sha256sum } = MASP_PARAM_LEN[param];

  // Reject if invalid length (incomplete download or invalid)
  console.log(`Validating data length for ${param}, expecting ${length}...`);

  if (length !== bytes.length) {
    return Promise.reject(
      `Invalid data length! Expected ${length}, received ${bytes.length}!`
    );
  }

  // Reject if invalid hash (otherwise invalid data)
  console.log(`Validating sha256sum for ${param}, expecting ${sha256sum}...`);
  const hash = await sha256Hash(bytes);

  if (hash !== sha256sum) {
    return Promise.reject(
      `Invalid sha256sum! Expected ${sha256sum}, received ${hash}!`
    );
  }

  return { param, bytes };
};

const logSuccess = ({ param, bytes }: MaspParamBytes): void => {
  console.info(`Fetched and stored ${param}:`, bytes);
};

// MOVE TO INVOKE IN HANDLER
(async () => {
  const maspOutputParamBytes = await store.get(MaspParam.Output);
  console.log("Found output?: ", maspOutputParamBytes);

  const maspSpendParamBytes = await store.get(MaspParam.Spend);
  console.log("Found spend?: ", maspSpendParamBytes);

  const maspConvertParamBytes = await store.get(MaspParam.Convert);
  console.log("Found convert?", maspConvertParamBytes);

  if (!maspOutputParamBytes) {
    await fetchMaspParam(MaspParam.Output)
      .then(validateMaspParamBytes)
      .then(storeMaspParam)
      .then(logSuccess)
      .catch((e) => console.error(e));
  }

  if (!maspSpendParamBytes) {
    await fetchMaspParam(MaspParam.Spend)
      .then(validateMaspParamBytes)
      .then(storeMaspParam)
      .then(logSuccess)
      .catch((e) => console.error(e));
  }

  if (!maspConvertParamBytes) {
    await fetchMaspParam(MaspParam.Convert)
      .then(validateMaspParamBytes)
      .then(storeMaspParam)
      .then(logSuccess)
      .catch((e) => console.error(e));
  }
})();
