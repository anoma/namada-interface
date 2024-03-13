import { webcrypto } from "node:crypto";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).crypto = webcrypto;

// Make Ledger available for direct-import as it is not dependent on Sdk initialization
export * from "./ledger";

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
export { default as initSync } from "./initSync";
