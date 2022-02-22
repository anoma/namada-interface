import { JsonRpcRequest } from "@cosmjs/json-rpc";
import { fromHex } from "@cosmjs/encoding";
import { JsonCompatibleArray, JsonCompatibleDictionary } from "lib/rpc/types";

/**
 * Race a promise against a timeout
 */
export const promiseWithTimeout = <T = any>(
  promise: Promise<T>,
  timeout: number = 4000
) => {
  let timeoutId: ReturnType<typeof setTimeout> | number = -1;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error("Request timed out"));
    }, timeout);
  });
  return {
    promise: Promise.race([promise, timeoutPromise]),
    timeoutId,
  };
};

/**
 * Convert a hex keypair to a serializable keypair object
 */
export const hexToKeypair = (
  keypair: string
): { secret: Uint8Array; public: Uint8Array } => {
  const [, priv, pub] = keypair.split("20000000");
  return {
    secret: fromHex(priv),
    public: fromHex(pub),
  };
};

const MICRO_FACTOR = 1000000; // 1,000,000

/**
 * Amount to Micro
 */
export const amountToMicro = (amount: number) => {
  return amount * MICRO_FACTOR;
};

/**
 * Amount from Micro
 */
export const amountFromMicro = (micro: number) => {
  return micro / MICRO_FACTOR;
};

/**
 * Format a proper JSON RPC request from method and params
 */
export const createJsonRpcRequest = (
  method: string,
  params: JsonCompatibleArray | JsonCompatibleDictionary
): JsonRpcRequest => {
  return {
    id: "",
    jsonrpc: "2.0",
    method,
    params,
  };
};
