import { JsonRpcRequest } from "@cosmjs/json-rpc";
import { DateTime } from "luxon";
import BigNumber from "bignumber.js";
import {
  Bip44Path,
  JsonCompatibleArray,
  JsonCompatibleDictionary,
} from "@namada/types";

const MICRO_FACTOR = 1000000; // 1,000,000

/**
 * Amount to Micro
 */
export const amountToMicro = (amount: BigNumber): BigNumber => {
  return amount.multipliedBy(MICRO_FACTOR);
};

/**
 * Amount from Micro
 */
export const amountFromMicro = (micro: BigNumber): BigNumber => {
  return micro.dividedBy(MICRO_FACTOR);
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
 * Format absolute React Router paths
 * @param {string[]} routes
 * @returns {string}
 */
export const formatRouterPath = (routes: string[]): string =>
  `/${routes.join("/")}`;

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
 * Format by currency using the user's locale.
 * Returns null if the value cannot fit in a number primitive.
 * @param currency
 * @param value
 * @returns {string}
 */
export const formatCurrency = (
  currency = "USD",
  value: BigNumber = new BigNumber(0)
): string | null => {
  // only allow -1 * Number.MAX_VALUE <= value <= Number.MAX_VALUE
  if (value.absoluteValue().isGreaterThan(Number.MAX_VALUE)) {
    return null;
  } else {
    const asNumber = value.toNumber();

    const formatter = Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    });

    return formatter.format(asNumber);
  }
};

/**
 * Get timestamp
 *
 * @returns {number}
 */
export const getTimeStamp = (): number => Math.floor(Date.now() / 1000);

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

export const truncateInMiddle = (
  str: string,
  firstCharCount = str.length,
  endCharCount = 0
): string => {
  return (
    str.substring(0, firstCharCount) +
    "…" +
    str.substring(str.length - endCharCount, str.length)
  );
};

/**
 * Assert that a value is of type `never`, the type with no possible values.
 *
 * Useful for making the compiler throw an error if you forget to
 * check a possible case e.g. when switching on the value of an enum.
 */
export const assertNever = (x: never): never => {
  throw new Error("this should never happen");
  return x;
};

export type Ok<T> = { ok: true; value: T };
export type Err<E> = { ok: false; error: E };

/**
 * Result type used to indicate success or failure.
 * A value of type T is returned on success (Ok), and an error of type
 * E is returned on failure (Err).
 *
 * Ok and Err types can be built with the helper functions Result.ok
 * and Result.err.
 */
export type Result<T, E> = Ok<T> | Err<E>;

export const Result = {
  ok: function <T>(value: T): Ok<T> {
    return { ok: true as const, value };
  },

  err: function <E>(error: E): Err<E> {
    return { ok: false as const, error };
  },
};

/**
 * Return a properly formatted BIP-044 path
 *
 * @param {number} coinType - SLIP-044 Coin designation
 * @param {Bip44Path} bip44Path - path object
 * @returns {string}
 */
export const makeBip44Path = (
  coinType: number,
  bip44Path: Bip44Path
): string => {
  const { account, change, index } = bip44Path;
  const basePath = `m/44'/${coinType}'/${account}'/${change}`;

  return typeof index === "number" ? `${basePath}/${index}` : basePath;
};

/**
 * Pick object parameters
 */
export function pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
  return keys.reduce((acc, val) => {
    return (acc[val] = obj[val]), acc;
  }, {} as Pick<T, K>);
}
