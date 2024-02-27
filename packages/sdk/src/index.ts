// Make Ledger available for direct-import as it is not dependent on Sdk initialization
import { init } from "init";
import { Sdk as SDK } from "./sdk";

export * from "./ledger";

// Wrap Sdk export so initialization can happen outside of
// class definition (for running tests using wasm built for Node JS)
export const Sdk = {
  init: (url: string, token?: string): Promise<SDK> => {
    return init(url, token);
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
