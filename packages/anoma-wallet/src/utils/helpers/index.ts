import * as CryptoJS from "crypto-js";
import { JsonRpcRequest } from "@cosmjs/json-rpc";
import { JsonCompatibleArray, JsonCompatibleDictionary } from "lib/rpc/types";

/**
 * Race a promise against a timeout
 */
export const promiseWithTimeout = <T = unknown>(
  promise: Promise<T>,
  timeout = 4000
): { promise: Promise<T>; timeoutId: number } => {
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

const MICRO_FACTOR = 1000000; // 1,000,000

/**
 * Amount to Micro
 */
export const amountToMicro = (amount: number): number => {
  return amount * MICRO_FACTOR;
};

/**
 * Amount from Micro
 */
export const amountFromMicro = (micro: number): number => {
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

/**
 * Encrypt a string with a password
 */
export const aesEncrypt = (value: string, password: string): string => {
  const key = CryptoJS.enc.Utf8.parse(password);
  const iv = CryptoJS.enc.Utf8.parse(password);
  const encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(value), key, {
    keySize: 128 / 8,
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return encrypted.toString();
};

/**
 * Decrypt an encrypted string with password
 */
export const aesDecrypt = (encrypted: string, password: string): string => {
  const key = CryptoJS.enc.Utf8.parse(password);
  const iv = CryptoJS.enc.Utf8.parse(password);

  try {
    const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
      keySize: 128 / 8,
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    throw new Error(`Unable to decrypt value: ${e}`);
  }
};

export const getParams = (
  prop?: string
): string | { [key: string]: string } => {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());
  return prop ? params[prop] : params;
};
