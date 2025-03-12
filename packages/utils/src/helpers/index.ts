import { JsonRpcRequest } from "@cosmjs/json-rpc";
import { JsonCompatibleArray, JsonCompatibleDictionary } from "@namada/types";
import { bech32m } from "bech32";
import BigNumber from "bignumber.js";
import * as fns from "date-fns";
import { DateTime } from "luxon";

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
 * Format a date-time string from a timestamp in seconds
 */
export const stringFromTimestampInSec = (timestamp: bigint): string => {
  const datetime = DateTime.fromSeconds(Number(timestamp)).toLocal();
  return datetime.toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS);
};

type FnsDurationUnit = fns.DurationUnit;

export const getMostSignificantDurationUnit = (
  duration: fns.Duration,
  format: FnsDurationUnit[]
): fns.DurationUnit => {
  const display = format.reduce(
    (acc, curr) => {
      const value = duration[curr] || 0;

      return !acc && value > 0 ? curr : acc;
    },
    undefined as FnsDurationUnit | undefined
  );

  return display || "seconds";
};

/**
 * Get formatted duration from interval
 *
 * @param {number} fromSec - from date in seconds
 * @param {number} toSec - to date in seconds
 * @returns {string} formatted duration
 */
export const singleUnitDurationFromInterval = (
  fromSec: number,
  toSec: number
): string => {
  const interval = {
    start: fromSec * 1000,
    end: toSec * 1000,
  };
  const format: FnsDurationUnit[] = ["days", "hours", "minutes", "seconds"];

  const timeLeft = fns.intervalToDuration(interval);
  const unit = getMostSignificantDurationUnit(timeLeft, format);
  const previousUnit = format[format.indexOf(unit) + 1];
  const previousUnitTime = timeLeft[previousUnit] || 0;

  const adjustedTimeLeft = {
    ...timeLeft,
    [unit]: previousUnitTime > 30 ? timeLeft[unit]! + 1 : timeLeft[unit],
  };

  const formattedDuration = fns.formatDuration(adjustedTimeLeft, {
    format: [unit],
    zero: true,
    delimiter: ": ",
  });

  return formattedDuration.replace(/^.*seconds?$/, "< minute");
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
  if (address.length <= prefixLength + suffixLength) {
    return address;
  }
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
// eslint-disable-next-line
export const assertNever = (error: never): never => {
  throw new Error(`This should never happen: ${error}`);
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
 * Pick object parameters
 */
export function pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
  return keys.reduce(
    (acc, val) => {
      return (acc[val] = obj[val]), acc;
    },
    {} as Pick<T, K>
  );
}

/**
 * Format url with query string params using an object
 *
 * @param {string} url
 * @param {object} params
 * @returns {string}
 */
export function paramsToUrl(
  url: string,
  params: Record<string, string>
): string {
  const queryString = new URLSearchParams(params).toString();

  if (queryString) {
    return `${url}?${queryString}`;
  }
  return url;
}

export const formatPercentage = (
  bigNumber: BigNumber,
  decimalPlaces: number = 2
): string => {
  const percentage = bigNumber.multipliedBy(100);
  const rounded =
    typeof decimalPlaces === "undefined" ? percentage : (
      percentage.decimalPlaces(decimalPlaces)
    );
  return rounded.toString() + "%";
};

/**
 * Applies a function to a value that is possibly undefined.
 */
export const mapUndefined = <A, B>(
  transform: (value: A) => B,
  input: A | undefined
): B | undefined => (input !== undefined ? transform(input) : undefined);

export const isEmptyObject = (object: Record<string, unknown>): boolean => {
  return Object.keys(object).length === 0;
};

export const copyToClipboard = (value: string): void => {
  if (typeof navigator !== "undefined") {
    navigator.clipboard.writeText(value);
  }
};

/**
  Checks if a string is a valid bech32m address with the expected prefix
 *
 * @param {string} expectedPrefix
 * @param {string} value
 * @returns {string}
 */
export const bech32mValidation = (
  expectedPrefix: string,
  value: string
): boolean => {
  try {
    const { prefix } = bech32m.decode(value);
    return prefix === expectedPrefix;
  } catch {
    return false;
  }
};

export const matchMapFn = (
  key: string,
  objMap: Record<string, () => void>
): void => {
  if (objMap.hasOwnProperty(key)) {
    objMap[key]();
    return;
  }
};

/**
 * Check that an input url is valid
 *
 * @param {string} url
 * @returns {boolean}
 */
export const isUrlValid = (url: string): boolean => {
  try {
    const newUrl = new URL(url);
    return ["http:", "https:", "ws:", "wss:"].includes(newUrl.protocol);
  } catch {
    return false;
  }
};

/**
 * Sanitize the url removing leading and trailing spaces as well the trailing slash
 *
 * @param {string} url
 * @returns {string}
 */
export const sanitizeUrl = (url: string): string => {
  const trimmedUrl = url.trim();
  return trimmedUrl.endsWith("/") ? trimmedUrl.slice(0, -1) : url;
};

/**
 * Searches through an object and creates BigNumbers from any object with
 * the _isBigNumber property. This is needed because BigNumbers lose their
 * prototype when sent between extension scripts in Firefox.
 *
 * Returns the object with the BigNumbers reconstructed.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const deserializeBigNumbers = (result: any): any => {
  if (typeof result !== "object" || result === null) {
    return result;
  }

  if (result["_isBigNumber"]) {
    return BigNumber(result as BigNumber.Value);
  }

  const unseenValues = [result];

  while (unseenValues.length !== 0) {
    const obj = unseenValues.pop();
    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === "object" && value !== null) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((value as any)["_isBigNumber"]) {
          obj[key] = BigNumber(value as BigNumber.Value);
        } else {
          unseenValues.push(value);
        }
      }
    });
  }

  return result;
};

/**
 * Searches through an object and adds the _isBigNumber key to any BigNumber
 * values. This key is used by the BigNumber constructor to reconstruct a
 * BigNumber from a plain object, and is needed because BigNumbers lose their
 * prototype when sent between extension scripts in Firefox.
 *
 * Fixes object in place and returns void.
 */
export const serializeBigNumbers = (result: unknown): void => {
  const unseenValues = [result];

  while (unseenValues.length !== 0) {
    const value = unseenValues.pop();

    if (typeof value === "object" && value !== null) {
      if (BigNumber.isBigNumber(value)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (value as any)["_isBigNumber"] = true;
      } else {
        unseenValues.push(...Object.values(value));
      }
    }
  }
};
