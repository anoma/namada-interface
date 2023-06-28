import { Query as RustQuery } from "./shared/shared";
export * from "./shared/shared";

/**
 *  CallWithTimeout - calls a function with specified timeout
 */
const cwt =
  <U extends unknown[], T>(fn: (...args: U) => Promise<T>, timeout = 5) =>
  (...args: U): Promise<T> => {
    return new Promise(async (resolve, reject) => {
      const t = setTimeout(() => {
        reject(`Balance query timed out after ${timeout}s.`);
      }, timeout * 1000);

      const res = await fn(...args);
      clearTimeout(t);
      resolve(res);
    });
  };

export class Query extends RustQuery {
  query_balance = cwt(super.query_balance.bind(this), 10);
  query_epoch = cwt(super.query_epoch.bind(this));
  query_all_validators = cwt(super.query_all_validators.bind(this));
  query_my_validators = cwt(super.query_my_validators.bind(this));
}
