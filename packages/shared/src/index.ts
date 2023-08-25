import { Query as RustQuery } from "./shared/shared";
export * from "./shared/shared";

type TimeoutOpts = {
  // Timeout in miliseconds
  timeout?: number;
  // Error message
  error?: string;
};

const DEFAULT_TIMEOUT = 60000;

const DEFAULT_OPTS: TimeoutOpts = {
  timeout: DEFAULT_TIMEOUT,
  error: `Promise timed out after ${DEFAULT_TIMEOUT} ms.`,
};

/**
 *  promiseWithTimeout - calls an async function with specified timeout
 */
const promiseWithTimeout =
  <U extends unknown[], T>(
    fn: (...args: U) => Promise<T>,
    opts?: TimeoutOpts
  ) =>
    (...args: U): Promise<T> => {
      const { timeout, error } = { ...DEFAULT_OPTS, ...opts };

      return new Promise(async (resolve, reject) => {
        const t = setTimeout(() => {
          reject(error);
        }, timeout);

        const res = await fn(...args);
        clearTimeout(t);
        resolve(res);
      });
    };

export class Query extends RustQuery {
  query_balance = promiseWithTimeout(super.query_balance.bind(this), {
    timeout: 10000,
  });
  query_epoch = promiseWithTimeout(super.query_epoch.bind(this));
  query_all_validators = promiseWithTimeout(
    super.query_all_validators.bind(this)
  );
  query_my_validators = promiseWithTimeout(
    super.query_my_validators.bind(this)
  );
}

export * from "./types";
