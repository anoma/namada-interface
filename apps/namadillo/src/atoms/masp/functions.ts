import { toBase64 } from "@cosmjs/encoding";
import { IndexedDBKVStore } from "@namada/storage";
import { MaspParam } from "types";
import { sha256Hash } from "utils";
import { MASP_PARAMS_URL, MaspParamConfigs } from "./types";

export type MaspParamBytes = {
  param: MaspParam;
  bytes: Uint8Array;
};

export type MaspParamBytesProgress = {
  param: MaspParam;
  chunkSize: number;
  expectedSize: number;
  progress: number;
};

export type MaspParamBytesComplete = {
  param: MaspParam;
  progress: number;
};

/**
 * Fetch a MASP Param, and stream the bytes, resolving to Uint8Array if successful
 */
export const fetchMaspParam = async (
  param: MaspParam,
  // Optional callback to track download progress
  onRead?: (progress: MaspParamBytesProgress) => void,
  // Optional callback for download complete
  onComplete?: (complete: MaspParamBytesComplete) => void
): Promise<MaspParamBytes> => {
  return fetch([MASP_PARAMS_URL, param].join("/"))
    .then(async (response) => {
      if (response.ok) {
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No readable stream returned!");
        }
        return new ReadableStream({
          start(controller) {
            // Track download progress
            const expectedSize = MaspParamConfigs[param].length;
            let progress: number = 0;
            // Start pumping the stream
            return pump();
            async function pump(): Promise<typeof pump | undefined> {
              return reader?.read().then(({ done, value }) => {
                // Invoke callback if provided
                if (onRead && value) {
                  const chunkSize = value.length;
                  progress += chunkSize;
                  onRead({
                    param,
                    chunkSize,
                    expectedSize,
                    progress,
                  });
                }
                // When no more data needs to be consumed, close the stream
                if (done) {
                  controller.close();
                  // Invoke callback with current param & progress if callback was provided
                  if (onComplete)
                    onComplete({
                      param,
                      progress,
                    });
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
        param: param,
        bytes: new Uint8Array(arrayBuffer),
      };
    });
};

export const storeMaspParam = async (
  store: IndexedDBKVStore<string>,
  { param, bytes }: MaspParamBytes
): Promise<MaspParamBytes> => {
  console.info(`Storing ${param}...`);
  const base64Bytes = toBase64(bytes);
  await store.set(param, base64Bytes);
  return {
    param,
    bytes,
  };
};

export const validateMaspParamBytes = async ({
  param,
  bytes,
}: MaspParamBytes): Promise<MaspParamBytes> => {
  const { length, sha256sum } = MaspParamConfigs[param];

  // Reject if invalid length (incomplete download or invalid)
  if (length !== bytes.length) {
    return Promise.reject(
      `Invalid data length for ${param}! Expected ${length}, received ${bytes.length}!`
    );
  }

  // Reject if invalid hash (otherwise invalid data)
  const hash = await sha256Hash(bytes);

  if (hash !== sha256sum) {
    return Promise.reject(
      `Invalid sha256 checksum for ${param}! Expected ${sha256sum}, received ${hash}!`
    );
  }

  return { param, bytes };
};
