import { JsonRpcRequest } from "@cosmjs/json-rpc";
import { DateTime } from "luxon";
import { JsonCompatibleArray, JsonCompatibleDictionary } from "@anoma/rpc";

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

/*
 * Shorten a Bech32 address
 */
export const shortenAddress = (
  address: string,
  prefixLength = 32,
  suffixLength = 6,
  delimiter = "..."
): string => {
  const prefix = address.substring(0, prefixLength);
  const suffix = address.substring(
    address.length - suffixLength,
    address.length
  );
  return [prefix, delimiter, suffix].join("");
};
