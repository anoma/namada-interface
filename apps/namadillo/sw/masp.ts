type MaspParamBytes = {
  param: MaspParam;
  bytes: Uint8Array;
};

const fetchMaspParam = async (
  maspParam: MaspParam,
  onRead?: (value?: Uint8Array) => void,
  onComplete?: () => void
): Promise<MaspParamBytes> => {
  return fetch([MASP_MPC_URL, maspParam].join("/"))
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
  console.info(`Storing ${param}...`);
  await store.set(param, bytes);
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
