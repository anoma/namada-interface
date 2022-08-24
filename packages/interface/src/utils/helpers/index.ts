import CryptoJS from "crypto-js";
import { JsonRpcRequest } from "@cosmjs/json-rpc";
import base58 from "bs58";
import { DateTime } from "luxon";
import { JsonCompatibleArray, JsonCompatibleDictionary } from "lib/rpc/types";
import { Protocol } from "config";

/**
 * Race a promise against a timeout
 */
export const promiseWithTimeout = <T = unknown>(
  promise: Promise<T>,
  timeout = 4000,
  error = "Request timed out"
): {
  promise: Promise<T>;
  timeoutId: number;
} => {
  let timeoutId: ReturnType<typeof setTimeout> | number = -1;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(error));
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

/**
 * Hash a provided password
 */
export const hashPassword = (password: string): string => {
  const hash = CryptoJS.SHA3(password, { outputLength: 512 });
  return hash.toString(CryptoJS.enc.Base64);
};

/**
 * Create a short base58 encoded hash of a string.
 * Useful for creating URL-friendly hashes of storage
 * values in state.
 */
export const stringToHash = (value: string): string => {
  const hash = CryptoJS.MD5(value);
  return base58.encode(new Uint8Array(hash.words));
};

/**
 * Map parameters to a route definition, returning formatted route string
 */
export const formatRoute = (
  route: string,
  params: { [key: string]: string | number }
): string => {
  let formatted = route;

  for (const param in params) {
    formatted = formatted.replace(`:${param}`, `${params[param]}`);
  }

  return formatted;
};

/**
 * Format a date-time string from a timestamp
 */
export const stringFromTimestamp = (timestamp: number): string => {
  const datetime = DateTime.fromMillis(timestamp).toLocal();
  return datetime.toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS);
};

/**
 * Get URL params
 */
export const getParams = (
  prop?: string
): string | { [key: string]: string } => {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());
  return prop ? params[prop] : params;
};

/**
 * Format by currency using the user's locale
 * @param currency
 * @param value
 * @returns {string}
 */
export const formatCurrency = (currency = "USD", value = 0): string => {
  const formatter = Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  });

  return formatter.format(value);
};

/**
 * Get timestamp
 *
 * @returns {number}
 */
export const getTimeStamp = (): number => Math.floor(Date.now() / 1000);

/**
 * Remove any comments ("#") or quotes
 * @param url
 * @returns {string}
 */
export const stripInvalidCharacters = (url = ""): string => {
  // Ignore comments and quotes
  return url.split("#")[0].replace(/\"|\'/, "");
};

/**
 * Remove any characters after whitespace from env value
 * @param value
 * @returns {string}
 */
export const sanitize = (value = " "): string => {
  return stripInvalidCharacters(value).split(" ")[0];
};

/**
 * Return URL with no prefixed protocol
 * @param url
 * @returns {string}
 */
export const getUrl = (url = ""): string => {
  return sanitize(url).replace(/^https?\:\/\//, "");
};

/**
 * Get the protocol from a URL or return default
 * @param url
 * @returns {Protocol}
 */
export const getUrlProtocol = (url?: string): Protocol => {
  const prefix = sanitize(url).split(":")[0];

  if (prefix === "https") {
    return "https";
  }

  return "http";
};
