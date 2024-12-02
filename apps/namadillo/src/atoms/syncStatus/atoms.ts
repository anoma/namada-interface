import { accountBalanceAtom, transparentBalanceAtom } from "atoms/accounts";
import { shieldedBalanceAtom } from "atoms/balance";
import { allProposalsAtom, votedProposalsAtom } from "atoms/proposals";
import { indexerHeartbeatAtom, rpcHeartbeatAtom } from "atoms/settings/atoms";
import { allValidatorsAtom, myValidatorsAtom } from "atoms/validators";
import { atom } from "jotai";

export const syncStatusAtom = atom((get) => {
  const queries = [
    // Heartbeat
    get(indexerHeartbeatAtom),
    get(rpcHeartbeatAtom),

    // Account Overview
    get(shieldedBalanceAtom),
    get(transparentBalanceAtom),

    // Staking
    get(accountBalanceAtom),
    get(myValidatorsAtom),
    get(allValidatorsAtom),

    // Governance
    get(allProposalsAtom),
    get(votedProposalsAtom),
  ];

  const isSyncing = queries.some((q) => q.isFetching);
  const isError = queries.some((q) => q.isError);
  const error = queries.find((q) => q.error)?.error || undefined;

  return {
    isSyncing,
    isError,
    error,
  };
});
