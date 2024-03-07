import initAsync from "./initAsync";
import { Sdk as SDK } from "./sdk";

// Make Ledger available for direct-import as it is not dependent on Sdk initialization
export * from "./ledger";

// Wrap Sdk export so initialization can happen outside of
// class definition (for running tests using wasm built for Node JS)
export const Sdk = {
  /**
   * Initialize Sdk for web applications
   * @param {string} url - node url
   * @param {string} token - native token address
   * @returns {Promise<SDK>} - Sdk instance
   */
  init: (url: string, token?: string): Promise<SDK> => {
    return initAsync(url, token);
  },
};

// Export types
export type { Address, ShieldedKeys, TransparentKeys } from "./keys";
export type {
  Balance,
  Bonds,
  DelegationTotals,
  DelegatorsVotes,
  StakingPositions,
  StakingTotals,
  Unbonds,
} from "./rpc";
export { EncodedTx, SignedTx } from "./tx";

// Export init functions for direct usage
export { default as initAsync } from "./initAsync";
export { default as initSync } from "./initSync";
