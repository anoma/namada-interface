import { deserialize } from "@dao-xyz/borsh";

import { Proposal, Proposals } from "./borsh-schemas";
import { Query as RustQuery } from "./shared/shared";
export * from "./shared/shared";
export * from "./types";

type TimeoutOpts = {
  // Timeout in milliseconds
  timeout?: number;
  // Error message
  error?: (timeout: number) => string;
};

const DEFAULT_TIMEOUT = 60000;

const DEFAULT_OPTS: Required<TimeoutOpts> = {
  timeout: DEFAULT_TIMEOUT,
  error: (timeout) => `Promise timed out after ${timeout} ms.`,
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

//Fallbacks for rust panics
export class Query extends RustQuery {
  private _query_proposals = super.query_proposals.bind(this);
  query_balance = promiseWithTimeout(super.query_balance.bind(this), {
    timeout: 30000,
  });
  query_epoch = promiseWithTimeout(super.query_epoch.bind(this));
  query_all_validator_addresses = promiseWithTimeout(
    super.query_all_validator_addresses.bind(this)
  );
  query_my_validators = promiseWithTimeout(
    super.query_my_validators.bind(this)
  );
  query_total_bonds = promiseWithTimeout(super.query_total_bonds.bind(this));
  delegators_votes = promiseWithTimeout(super.delegators_votes.bind(this));
  queryProposals = async (): Promise<Proposal[]> => {
    const fn = this._query_proposals;
    const serializedProposals = await fn();
    const { proposals } = deserialize(serializedProposals, Proposals);
    return proposals;
  };
  get_total_delegations = promiseWithTimeout(
    super.get_total_delegations.bind(this)
  );
}

export * from "./types";
