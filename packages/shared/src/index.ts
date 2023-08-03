import { isLeft } from "fp-ts/Either";
import { PathReporter } from "io-ts/PathReporter";

import { Proposals } from "./types";
import type { Proposal } from "./types";
import { Query as RustQuery } from "./shared/shared";
import { Type } from "io-ts";
export * from "./shared/shared";
export * from "./types";

type TimeoutOpts = {
  // Timeout in miliseconds
  timeout?: number;
  // Error message
  error?: (timeout: number) => string;
};

const DEFAULT_TIMEOUT = 60000;

const DEFAULT_OPTS: Required<TimeoutOpts> = {
  timeout: DEFAULT_TIMEOUT,
  error: timeout => `Promise timed out after ${timeout} ms.`,
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
          reject(error(timeout));
        }, timeout);

      const res = await fn(...args);
      clearTimeout(t);
      resolve(res);
    });
  };

const validateData = <T>(data: any, type: Type<T>): T => {
  const decoded = type.decode(data);
  if (isLeft(decoded)) {
    throw Error(
      `Could not validate data: ${PathReporter.report(decoded).join("\n")}`
    );
  } else {
    return decoded.right;
  }
};

//Fallbacks for rust panics
export class Query extends RustQuery {
  _query_proposals = super.query_proposals.bind(this);
  query_balance = promiseWithTimeout(super.query_balance.bind(this), {
    timeout: 10000,
  });
  query_epoch = promiseWithTimeout(super.query_epoch.bind(this));
  query_all_validator_addresses = promiseWithTimeout(
    super.query_all_validator_addresses.bind(this)
  );
  query_my_validators = promiseWithTimeout(
    super.query_my_validators.bind(this)
  );
  query_total_bonds = promiseWithTimeout(
    super.query_total_bonds.bind(this)
  get_proposal_votes = promiseWithTimeout(super.get_proposal_votes.bind(this));
  query_proposals = async (): Promise<Proposal[]> => {
    const fn = this._query_proposals;
    const proposals = await fn();
    console.log(proposals);
    return validateData(proposals, Proposals);
  };
  get_total_delegations = promiseWithTimeout(
    super.get_total_delegations.bind(this)
  );
}

export * from "./types";
